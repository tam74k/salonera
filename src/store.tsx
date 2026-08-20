import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type Lang = 'ar' | 'en';
type UserRole = 'guest' | 'client' | 'artist' | 'cashier' | 'admin' | 'super_admin';

interface AppContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isAr: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User | null;
  session: Session | null;
  isLoadingAuth: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');
  const [role, setRole] = useState<UserRole>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole('guest');
        setIsLoadingAuth(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole('guest');
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRole(data.role as UserRole);
      } else {
        setRole('client'); // Default fallback
      }
    } catch (err) {
      console.error("Failed to fetch role", err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AppContext.Provider value={{ lang, setLang, isAr: lang === 'ar', role, setRole, user, session, isLoadingAuth }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
