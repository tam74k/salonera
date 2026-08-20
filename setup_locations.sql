-- 1. Create Countries Table
CREATE TABLE public.countries (
    id SERIAL PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    dial_code TEXT NOT NULL
);

-- 2. Create Governorates Table
CREATE TABLE public.governorates (
    id SERIAL PRIMARY KEY,
    country_id INT REFERENCES public.countries(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);

-- 3. Create Cities Table
CREATE TABLE public.cities (
    id SERIAL PRIMARY KEY,
    governorate_id INT REFERENCES public.governorates(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);

-- 4. Alter Salons and Profiles to link to the new tables
ALTER TABLE public.salons
ADD COLUMN IF NOT EXISTS country_id INT REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS governorate_id INT REFERENCES public.governorates(id),
ADD COLUMN IF NOT EXISTS city_id INT REFERENCES public.cities(id);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country_id INT REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS governorate_id INT REFERENCES public.governorates(id),
ADD COLUMN IF NOT EXISTS city_id INT REFERENCES public.cities(id);

-- Enable RLS and add public read policies
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read access governorates" ON public.governorates FOR SELECT USING (true);
CREATE POLICY "Public read access cities" ON public.cities FOR SELECT USING (true);

-- 5. Insert Arab Countries
INSERT INTO public.countries (id, name_ar, name_en, dial_code) VALUES
(1, 'المملكة العربية السعودية', 'Saudi Arabia', '+966'),
(2, 'مصر', 'Egypt', '+20'),
(3, 'الإمارات العربية المتحدة', 'United Arab Emirates', '+971'),
(4, 'الكويت', 'Kuwait', '+965'),
(5, 'قطر', 'Qatar', '+974'),
(6, 'البحرين', 'Bahrain', '+973'),
(7, 'عمان', 'Oman', '+968'),
(8, 'الأردن', 'Jordan', '+962'),
(9, 'فلسطين', 'Palestine', '+970'),
(10, 'لبنان', 'Lebanon', '+961'),
(11, 'سوريا', 'Syria', '+963'),
(12, 'العراق', 'Iraq', '+964'),
(13, 'اليمن', 'Yemen', '+967'),
(14, 'السودان', 'Sudan', '+249'),
(15, 'ليبيا', 'Libya', '+218'),
(16, 'تونس', 'Tunisia', '+216'),
(17, 'الجزائر', 'Algeria', '+213'),
(18, 'المغرب', 'Morocco', '+212'),
(19, 'موريتانيا', 'Mauritania', '+222'),
(20, 'جيبوتي', 'Djibouti', '+253'),
(21, 'الصومال', 'Somalia', '+252'),
(22, 'جزر القمر', 'Comoros', '+269');

-- KSA Governorates and Cities
INSERT INTO public.governorates (id, country_id, name_ar, name_en) VALUES
(1, 1, 'منطقة الرياض', 'Riyadh Region'),
(2, 1, 'منطقة مكة المكرمة', 'Makkah Region'),
(3, 1, 'المنطقة الشرقية', 'Eastern Province');

INSERT INTO public.cities (governorate_id, name_ar, name_en) VALUES
(1, 'الرياض', 'Riyadh'),
(1, 'الخرج', 'Al Kharj'),
(2, 'مكة المكرمة', 'Makkah'),
(2, 'جدة', 'Jeddah'),
(2, 'الطائف', 'Taif'),
(3, 'الدمام', 'Dammam'),
(3, 'الخبر', 'Khobar');

-- Egypt Governorates and Cities
INSERT INTO public.governorates (id, country_id, name_ar, name_en) VALUES
(4, 2, 'محافظة القاهرة', 'Cairo Governorate'),
(5, 2, 'محافظة الجيزة', 'Giza Governorate'),
(6, 2, 'محافظة الإسكندرية', 'Alexandria Governorate');

INSERT INTO public.cities (governorate_id, name_ar, name_en) VALUES
(4, 'القاهرة', 'Cairo'),
(4, 'مدينة نصر', 'Nasr City'),
(4, 'المعادي', 'Maadi'),
(5, 'الجيزة', 'Giza'),
(5, 'الشيخ زايد', 'Sheikh Zayed'),
(6, 'الإسكندرية', 'Alexandria');

-- UAE Governorates and Cities
INSERT INTO public.governorates (id, country_id, name_ar, name_en) VALUES
(7, 3, 'إمارة دبي', 'Dubai Emirate'),
(8, 3, 'إمارة أبوظبي', 'Abu Dhabi Emirate'),
(9, 3, 'إمارة الشارقة', 'Sharjah Emirate');

INSERT INTO public.cities (governorate_id, name_ar, name_en) VALUES
(7, 'دبي', 'Dubai'),
(8, 'أبوظبي', 'Abu Dhabi'),
(9, 'الشارقة', 'Sharjah');

-- Ensure serial sequences are correct after explicit inserts
SELECT setval('countries_id_seq', (SELECT MAX(id) FROM public.countries));
SELECT setval('governorates_id_seq', (SELECT MAX(id) FROM public.governorates));
SELECT setval('cities_id_seq', (SELECT MAX(id) FROM public.cities));
