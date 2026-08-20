ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS evolution_instance TEXT;
UPDATE public.app_settings SET evolution_api_url = 'https://evo.101488.xyz' WHERE id = 'global';
