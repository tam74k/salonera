-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT UNIQUE,
    role TEXT CHECK (role IN ('admin', 'cashier', 'artist', 'client')) NOT NULL DEFAULT 'client',
    first_name_ar TEXT,
    first_name_en TEXT,
    last_name_ar TEXT,
    last_name_en TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Salons Table (Multi-tenant core)
CREATE TABLE public.salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('men', 'women', 'unisex')) NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    address_ar TEXT,
    address_en TEXT,
    lat NUMERIC,
    lng NUMERIC,
    email TEXT,
    mobile TEXT,
    whatsapp TEXT,
    social_media JSONB DEFAULT '{}'::jsonb, 
    country TEXT NOT NULL,
    currency TEXT NOT NULL,
    evolution_instance TEXT, 
    evolution_api_key TEXT,  
    max_bookings_per_hour_per_staff INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Salon Media (Photos for buckets)
CREATE TABLE public.salon_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    bucket_path TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Operating Hours
CREATE TABLE public.operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(salon_id, day_of_week)
);

-- 5. Services Table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    original_price NUMERIC NOT NULL,
    discounted_price NUMERIC,
    duration_minutes INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Staff / Artists Table
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    title_ar TEXT,
    title_en TEXT,
    bio_ar TEXT,
    bio_en TEXT,
    avatar_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Blocked Times / Holidays
CREATE TABLE public.blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE, -- Null means whole salon is closed
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Bookings Table (Updated)
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id),
    staff_id UUID REFERENCES public.staff(id), -- Nullable for "Any Available"
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled')) DEFAULT 'pending',
    extra_services JSONB DEFAULT '[]'::jsonb, 
    total_amount NUMERIC NOT NULL,
    imported BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Booking Details Table (Multiple services per booking)
CREATE TABLE public.booking_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_details ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.salon_media FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.operating_hours FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.blocked_times FOR SELECT USING (true);

-- User Profiles
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Salon Management (Admins)
CREATE POLICY "Admins manage salon" ON public.salons FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins manage media" ON public.salon_media FOR ALL USING (EXISTS (SELECT 1 FROM public.salons s WHERE s.id = salon_media.salon_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admins manage hours" ON public.operating_hours FOR ALL USING (EXISTS (SELECT 1 FROM public.salons s WHERE s.id = operating_hours.salon_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.salons s WHERE s.id = services.salon_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admins manage staff" ON public.staff FOR ALL USING (EXISTS (SELECT 1 FROM public.salons s WHERE s.id = staff.salon_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admins manage blocked times" ON public.blocked_times FOR ALL USING (EXISTS (SELECT 1 FROM public.salons s WHERE s.id = blocked_times.salon_id AND s.owner_id = auth.uid()));

-- Bookings & Details Management
CREATE POLICY "Clients manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Clients manage own details" ON public.booking_details FOR SELECT USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_details.booking_id AND b.client_id = auth.uid()));

CREATE POLICY "Cashiers/Admins manage all bookings" ON public.bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p JOIN public.salons s ON s.owner_id = p.id OR p.role = 'cashier' WHERE p.id = auth.uid() AND s.id = bookings.salon_id)
);
CREATE POLICY "Cashiers/Admins manage all details" ON public.booking_details FOR ALL USING (
    EXISTS (SELECT 1 FROM public.bookings b JOIN public.salons s ON s.id = b.salon_id JOIN public.profiles p ON p.id = auth.uid() WHERE b.id = booking_details.booking_id AND (s.owner_id = p.id OR p.role = 'cashier'))
);

CREATE POLICY "Artists manage assigned bookings" ON public.bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.staff s WHERE s.profile_id = auth.uid() AND s.id = bookings.staff_id)
);
CREATE POLICY "Artists view assigned details" ON public.booking_details FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings b JOIN public.staff s ON s.id = b.staff_id WHERE b.id = booking_details.booking_id AND s.profile_id = auth.uid())
);
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
