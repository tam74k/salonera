-- إعدادات النظام للإدمن الرئيسي (Super Admin)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- سياسة الأمان: السماح للإدمن الرئيسي فقط بالقراءة والتعديل
CREATE POLICY "Super admins manage app settings" ON public.app_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- إدراج صف افتراضي
INSERT INTO public.app_settings (id, evolution_api_url, evolution_api_key)
VALUES ('global', '', '')
ON CONFLICT (id) DO NOTHING;

-- تعديل جدول الصالونات لإضافة إعدادات Evolution API الخاصة بكل صالون (إذا لم تكن موجودة)
ALTER TABLE public.salons
ADD COLUMN IF NOT EXISTS evolution_instance TEXT,
ADD COLUMN IF NOT EXISTS evolution_api_key TEXT;
