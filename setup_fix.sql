INSERT INTO public.salons (owner_id, name_ar, name_en, type, country, currency)
SELECT id, 'صالوني', 'My Salon', 'both', 'SA', 'SAR'
FROM public.profiles
WHERE role = 'admin' 
AND NOT EXISTS (SELECT 1 FROM public.salons WHERE owner_id = profiles.id)
ON CONFLICT DO NOTHING;
