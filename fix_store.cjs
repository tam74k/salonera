const fs = require('fs');
let content = fs.readFileSync('src/store.tsx', 'utf8');

// 1. Add profile to type
content = content.replace("  session: Session | null;\n  isLoadingAuth: boolean;", "  session: Session | null;\n  profile: any;\n  isLoadingAuth: boolean;");

// 2. Add state
content = content.replace("  const [session, setSession] = useState<Session | null>(null);", "  const [session, setSession] = useState<Session | null>(null);\n  const [profile, setProfile] = useState<any>(null);");

// 3. Update fetchUserRole
const oldFetch = `  const fetchUserRole = async (userId: string) => {
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
  };`;

const newFetch = `  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRole(data.role as UserRole);
        setProfile(data);
      } else {
        setRole('client'); // Default fallback
      }
    } catch (err) {
      console.error("Failed to fetch role", err);
    } finally {
      setIsLoadingAuth(false);
    }
  };`;

content = content.replace(oldFetch, newFetch);

// 4. Reset profile on logout in useEffect
content = content.replace(/setRole\('guest'\);\n\s*setIsLoadingAuth\(false\);/g, "setRole('guest');\n        setProfile(null);\n        setIsLoadingAuth(false);");

// 5. Update Provider
content = content.replace("role, setRole, user, session, isLoadingAuth, headerTitle, setHeaderTitle", "role, setRole, user, session, profile, isLoadingAuth, headerTitle, setHeaderTitle");

fs.writeFileSync('src/store.tsx', content);
console.log("Updated store with profile");
