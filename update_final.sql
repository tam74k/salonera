-- 1. Add Bio columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio_ar TEXT,
ADD COLUMN IF NOT EXISTS bio_en TEXT;

-- 2. Update the RPC function to accept bio
CREATE OR REPLACE FUNCTION create_artist_user(
    p_email text,
    p_password text,
    p_first_name_ar text,
    p_first_name_en text,
    p_mobile text,
    p_salon_id uuid,
    p_avatar_url text,
    p_bio_ar text DEFAULT NULL,
    p_bio_en text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_encrypted_password text;
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;

    v_user_id := gen_random_uuid();
    v_encrypted_password := crypt(p_password, gen_salt('bf'));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', p_email, v_encrypted_password, now(),
        '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id::text, p_email)::jsonb, 'email', now(), now()
    );

    INSERT INTO public.profiles (
        id, role, email, mobile, first_name_ar, first_name_en, salon_id, avatar_url, bio_ar, bio_en
    ) VALUES (
        v_user_id, 'artist', p_email, p_mobile, p_first_name_ar, p_first_name_en, p_salon_id, p_avatar_url, p_bio_ar, p_bio_en
    );

    RETURN v_user_id;
END;
$$;

-- 3. Create Storage Buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('salons', 'salons', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('staff', 'staff', true) ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS and create policies for storage buckets
CREATE POLICY "Public Access salons" ON storage.objects FOR SELECT USING (bucket_id = 'salons');
CREATE POLICY "Auth Upload salons" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'salons' AND auth.role() = 'authenticated');
CREATE POLICY "Public Access staff" ON storage.objects FOR SELECT USING (bucket_id = 'staff');
CREATE POLICY "Auth Upload staff" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'staff' AND auth.role() = 'authenticated');
