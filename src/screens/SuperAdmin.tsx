import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { supabase } from '../lib/supabase';
import { Server, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n';

export function SuperAdminSettings() {
  const { isAr, lang } = useAppContext();
  const t = translations[lang];
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
    if (data) {
      setApiUrl(data.evolution_api_url || '');
      setApiKey(data.evolution_api_key || '');
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.from('app_settings').upsert({
      id: 'global',
      evolution_api_url: apiUrl,
      evolution_api_key: apiKey,
      updated_at: new Date().toISOString()
    });

    if (error) {
      setMessage({ type: 'error', text: isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings' });
    } else {
      setMessage({ type: 'success', text: isAr ? 'تم الحفظ بنجاح' : 'Settings saved successfully' });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isAr ? 'إعدادات النظام الرئيسية' : 'Super Admin Settings'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAr ? 'إعدادات Evolution API لإرسال رمز التحقق OTP للجميع' : 'Evolution API settings for global OTP'}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Evolution API URL</label>
            <input 
              type="url" 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.evolution.example.com"
              dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Evolution API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your global API key"
              dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="p-4 bg-amber-50 rounded-xl mb-6">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {isAr ? 'تنويه بخصوص Supabase' : 'Note about Supabase'}
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                {isAr 
                  ? 'لا يمكن تغيير مفاتيح Supabase من هنا لأن التطبيق يحتاج لها مسبقاً لكي يتصل بقاعدة البيانات ويقرأ هذه الصفحة! لتغييرها، استخدم لوحة تحكم المنصة (Settings -> Secrets).'
                  : 'Supabase keys cannot be changed here because the app needs them to connect to the database in the first place! To change them, use the platform Settings -> Secrets.'}
              </p>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:bg-indigo-400"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
