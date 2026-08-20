ALTER TABLE public.salons
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS working_hours_start TEXT DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS working_hours_end TEXT DEFAULT '22:00';

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS discount_price NUMERIC;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION create_artist_user(
    p_email text,
    p_password text,
    p_first_name_ar text,
    p_first_name_en text,
    p_mobile text,
    p_salon_id uuid,
    p_avatar_url text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_encrypted_password text;
BEGIN
    -- Check if user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;

    v_user_id := gen_random_uuid();
    v_encrypted_password := crypt(p_password, gen_salt('bf'));

    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', p_email, v_encrypted_password, now(),
        NULL, NULL, '{"provider":"email","providers":["email"]}', '{}',
        now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id::text, p_email)::jsonb, 'email', NULL, now(), now()
    );

    -- Create profile
    INSERT INTO public.profiles (
        id, role, email, mobile, first_name_ar, first_name_en, salon_id, avatar_url
    ) VALUES (
        v_user_id, 'artist', p_email, p_mobile, p_first_name_ar, p_first_name_en, p_salon_id, p_avatar_url
    );

    RETURN v_user_id;
END;
$$;
