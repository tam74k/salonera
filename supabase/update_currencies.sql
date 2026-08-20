ALTER TABLE public.countries
ADD COLUMN IF NOT EXISTS currency_ar TEXT,
ADD COLUMN IF NOT EXISTS currency_en TEXT;

UPDATE public.countries SET currency_ar = 'ر.س', currency_en = 'SAR' WHERE id = 1;
UPDATE public.countries SET currency_ar = 'ج.م', currency_en = 'EGP' WHERE id = 2;
UPDATE public.countries SET currency_ar = 'د.إ', currency_en = 'AED' WHERE id = 3;
UPDATE public.countries SET currency_ar = 'د.ك', currency_en = 'KWD' WHERE id = 4;
UPDATE public.countries SET currency_ar = 'ر.ق', currency_en = 'QAR' WHERE id = 5;
UPDATE public.countries SET currency_ar = 'د.ب', currency_en = 'BHD' WHERE id = 6;
UPDATE public.countries SET currency_ar = 'ر.ع', currency_en = 'OMR' WHERE id = 7;
UPDATE public.countries SET currency_ar = 'د.أ', currency_en = 'JOD' WHERE id = 8;
UPDATE public.countries SET currency_ar = 'ش.ج', currency_en = 'ILS' WHERE id = 9;
UPDATE public.countries SET currency_ar = 'ل.ل', currency_en = 'LBP' WHERE id = 10;
UPDATE public.countries SET currency_ar = 'ل.س', currency_en = 'SYP' WHERE id = 11;
UPDATE public.countries SET currency_ar = 'د.ع', currency_en = 'IQD' WHERE id = 12;
UPDATE public.countries SET currency_ar = 'ر.ي', currency_en = 'YER' WHERE id = 13;
UPDATE public.countries SET currency_ar = 'ج.س', currency_en = 'SDG' WHERE id = 14;
UPDATE public.countries SET currency_ar = 'د.ل', currency_en = 'LYD' WHERE id = 15;
UPDATE public.countries SET currency_ar = 'د.ت', currency_en = 'TND' WHERE id = 16;
UPDATE public.countries SET currency_ar = 'د.ج', currency_en = 'DZD' WHERE id = 17;
UPDATE public.countries SET currency_ar = 'د.م', currency_en = 'MAD' WHERE id = 18;
UPDATE public.countries SET currency_ar = 'أ.م', currency_en = 'MRU' WHERE id = 19;
UPDATE public.countries SET currency_ar = 'ف.ج', currency_en = 'DJF' WHERE id = 20;
UPDATE public.countries SET currency_ar = 'ش.ص', currency_en = 'SOS' WHERE id = 21;
UPDATE public.countries SET currency_ar = 'ف.ق', currency_en = 'KMF' WHERE id = 22;

NOTIFY pgrst, 'reload schema';
