import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';
import { Phone, Lock, Mail, MessageSquare, ChevronDown, AlertCircle, Loader2, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export function AuthFlow({ onLogin }: { onLogin: (role: 'client' | 'artist' | 'admin') => void }) {
  const { lang, isAr, setRole } = useAppContext();
  const t = translations[lang];
  
  const [step, setStep] = useState<'register' | 'otp' | 'login'>('login');
  const [selectedRole, setSelectedRole] = useState<'client' | 'artist' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [salonNameAr, setSalonNameAr] = useState('');
  const [salonNameEn, setSalonNameEn] = useState('');
  const [firstNameAr, setFirstNameAr] = useState('');
  const [firstNameEn, setFirstNameEn] = useState('');
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<any>('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);

  // Reset fields when component mounts (i.e. login screen opened)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setMobile('');
    setFirstNameAr('');
    setFirstNameEn('');
    setSalonNameAr('');
    setSalonNameEn('');
    setError('');
  }, []);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          setCountryCode(data.country_code);
        }
      })
      .catch(() => {});
  }, []);
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const enteredOtp = otpInputs.join('');
    if (enteredOtp !== generatedOtp) {
      setError(isAr ? 'كود التحقق غير صحيح' : 'Invalid verification code');
      return;
    }

    setLoading(true);
    setError('');
    // Proceed with Supabase registration since OTP matched
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: selectedRole,
            mobile: mobile
          }
        }
      });

      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        await supabase.from('profiles').update({
          first_name_ar: firstNameAr || firstNameEn,
          first_name_en: firstNameEn || firstNameAr
        }).eq('id', data.user.id);
      }
      
      if (selectedRole === 'admin' && data.user) {
         // Create the salon immediately
         const { error: salonErr } = await supabase.from('salons').insert({
             owner_id: data.user.id,
             name_ar: salonNameAr,
             name_en: salonNameEn,
             type: 'both',
             country: 'SA',
             country_id: 1,
             currency: 'SAR',
             mobile: mobile
         });
         if (salonErr) {
             console.error("Failed to insert salon:", salonErr);
         }
      }
      
      // If auto-login is successful
      if (data.session) {

        setEmail('');
        setPassword('');
        setFirstNameAr('');
        setFirstNameEn('');
        setSalonNameAr('');
        setSalonNameEn('');
        setMobile('');
        setOtpInputs(['', '', '', '']);

        setRole(selectedRole);
        onLogin(selectedRole);
      } else {
        // Fallback if email confirmation is required by Supabase settings
        setError(isAr ? 'تم التسجيل بنجاح. يمكنك تسجيل الدخول الآن.' : 'Registered successfully. You can log in now.');

        setEmail('');
        setPassword('');
        setFirstNameAr('');
        setFirstNameEn('');
        setSalonNameAr('');
        setSalonNameEn('');
        setMobile('');
        setOtpInputs(['', '', '', '']);

        setStep('login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      if (data.session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
        const roleToUse = profile?.role || 'client';
        setRole(roleToUse as any);
        
        setEmail('');
        setPassword('');
        setFirstNameAr('');
        setFirstNameEn('');
        setSalonNameAr('');
        setSalonNameEn('');
        setMobile('');
        setOtpInputs(['', '', '', '']);

        onLogin(roleToUse as any);
      }
      
    } catch (err: any) {
      setError(isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const startRegistration = async () => {
    if (!email || !password || !mobile || !firstNameAr || !firstNameEn) {
      setError(isAr ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (selectedRole === 'admin' && (!salonNameAr || !salonNameEn)) {
      setError(isAr ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);

    try {
      const { data: globalSettings } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
      const apiUrl = globalSettings?.evolution_api_url || 'https://evo.101488.xyz';
      const instance = globalSettings?.evolution_instance || 'TamerMostafa';
      const apiKey = globalSettings?.evolution_api_key || '78518239685A-4904-A7C3-827767FA2EEE';
      
      if (apiUrl && instance && apiKey) {
        const message = isAr 
          ? `مرحباً بك في Salonera!\nكود التحقق الخاص بك هو: *${otp}*`
          : `Welcome to Salonera!\nYour verification code is: *${otp}*`;
          
        const { sendWhatsAppMessage } = await import('../lib/whatsapp');
        await sendWhatsAppMessage(apiUrl, instance, apiKey, mobile, message);
      } else {
        console.warn('WhatsApp API not configured fully in global settings. Fallback OTP:', otp);
      }
    } catch (err) {
      console.error('Error sending OTP', err);
    }
    
    setLoading(false);
    setStep('otp');
  };

  return (
    <div className="min-h-screen bg-stone-900/40 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900 p-8 rounded-3xl shadow-md shadow-black/20 border border-stone-800/50 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-stone-50 tracking-tight">SALONERA</h2>
          <p className="text-stone-400 mt-2">
            {step === 'login' ? t.login : step === 'register' ? t.register : t.verify_otp}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.form key="login" onSubmit={handleLogin} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              
              
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{t.email}</label>

                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-stone-900/40 border border-stone-800 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-stone-900/40 border border-stone-800 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} placeholder="••••••••" />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <button type="button" className="text-stone-50 font-medium">{t.forgot_password}</button>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-none py-3.5 rounded-xl font-medium transition-colors mb-3 flex justify-center items-center gap-2 disabled:bg-zinc-500">
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t.login}
                </button>
              </div>
              
              <p className="text-center text-sm text-stone-400 mt-6">
                {isAr ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? '}
                <button type="button" onClick={() => { setStep('register'); setError(''); setEmail(''); setPassword(''); }} className="text-stone-50 font-bold">{t.register}</button>
              </p>
            </motion.form>
          )}

          {step === 'register' && (
            <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{isAr ? 'نوع الحساب' : 'Account Type'}</label>
                <div className="relative">
                  <select 
                    value={selectedRole === 'artist' ? 'client' : selectedRole} // Fallback
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className={`w-full bg-stone-900/40 border border-stone-800 rounded-xl py-3 appearance-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all ${isAr ? 'pl-4 pr-10' : 'pl-10 pr-4'}`}
                  >
                    <option value="client">{isAr ? 'عميل' : 'Client'}</option>
                    <option value="admin">{isAr ? 'إدارة الصالون' : 'Salon Admin'}</option>
                  </select>
                  <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 pointer-events-none ${isAr ? 'right-3' : 'left-3'}`} />
                </div>
              </div>
              
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1.5">{isAr ? 'الاسم الأول (عربي)' : 'First Name (Ar)'}</label>
                    <input type="text" required value={firstNameAr} onChange={(e) => setFirstNameAr(e.target.value)} className="w-full bg-stone-900/40 border border-stone-800 rounded-xl px-4 py-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1.5">{isAr ? 'الاسم الأول (انجليزي)' : 'First Name (En)'}</label>
                    <input type="text" required value={firstNameEn} onChange={(e) => setFirstNameEn(e.target.value)} className="w-full bg-stone-900/40 border border-stone-800 rounded-xl px-4 py-3 outline-none" />
                  </div>
              </div>

              {selectedRole === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1.5">{isAr ? 'اسم الصالون (عربي)' : 'Salon Name (Ar)'}</label>
                    <input type="text" required value={salonNameAr} onChange={(e) => setSalonNameAr(e.target.value)} className="w-full bg-stone-900/40 border border-stone-800 rounded-xl px-4 py-3 outline-none" placeholder="مثال: صالون الجمال" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1.5">{isAr ? 'اسم الصالون (انجليزي)' : 'Salon Name (En)'}</label>
                    <input type="text" required value={salonNameEn} onChange={(e) => setSalonNameEn(e.target.value)} className="w-full bg-stone-900/40 border border-stone-800 rounded-xl px-4 py-3 outline-none" placeholder="e.g: Beauty Salon" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-stone-900/40 border border-stone-800 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{t.mobile_number}</label>
                <div className="relative" dir="ltr">
                  <PhoneInput
                    international
                    defaultCountry={countryCode || 'SA'}
                    value={mobile}
                    onChange={(val: any) => setMobile(val || '')}
                    className="w-full bg-stone-900/40 border border-stone-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-900 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 ${isAr ? 'right-3' : 'left-3'}`} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-stone-900/40 border border-stone-800 rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all ${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} placeholder="••••••••" />
                </div>
              </div>
              
              <div className="pt-4">
                <button type="button" onClick={startRegistration} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-none py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t.send_otp} (WhatsApp)
                </button>
              </div>
              
              <p className="text-center text-sm text-stone-400 mt-6">
                {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <button type="button" onClick={() => { setStep('login'); setError(''); setEmail(''); setPassword(''); }} className="text-stone-50 font-bold">{t.login}</button>
              </p>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleVerifyOTP} className="space-y-6 text-center">
              <div className="w-16 h-16 bg-stone-800/50 rounded-full flex items-center justify-center mx-auto text-stone-50 mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="text-stone-400 text-sm">
                {isAr ? 'تم إرسال كود التحقق عبر الواتساب إلى رقمك.' : 'OTP code has been sent via WhatsApp to your number.'}
              </p>
              
              <div className="flex justify-center gap-3" dir="ltr">
                {[0, 1, 2, 3].map(i => (
                  <input 
                    key={i} 
                    id={`otp-${i}`}
                    type="text" 
                    maxLength={1} 
                    value={otpInputs[i]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newInputs = [...otpInputs];
                      newInputs[i] = val;
                      setOtpInputs(newInputs);
                      if (val && i < 3) {
                        document.getElementById(`otp-${i + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpInputs[i] && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold bg-stone-900/40 border border-stone-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-100 outline-none transition-all" 
                  />
                ))}
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-none py-3.5 rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:bg-zinc-500">
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t.verify_otp}
                </button>
              </div>
              
              <button type="button" onClick={() => setStep('register')} className="text-sm text-stone-400 hover:text-stone-200 font-medium transition-colors">
                {isAr ? 'رجوع' : 'Back'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
