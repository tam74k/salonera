-- 1. Create Booking Details Table (لتخزين تفاصيل الخدمات المتعددة للحجز الواحد)
CREATE TABLE public.booking_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Alter Bookings Table (تحديث جدول الحجوزات)
-- إزالة حقل الخدمة الواحدة القديم
ALTER TABLE public.bookings DROP COLUMN IF EXISTS service_id;

-- إضافة حقل imported
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS imported BOOLEAN DEFAULT false;

-- 3. RLS Policies for Booking Details (سياسات الأمان لجدول التفاصيل)
ALTER TABLE public.booking_details ENABLE ROW LEVEL SECURITY;

-- العميل يرى تفاصيل حجزه فقط
CREATE POLICY "Clients view own booking details" ON public.booking_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b 
            WHERE b.id = booking_details.booking_id AND b.client_id = auth.uid()
        )
    );

-- الكاشير ومدير الصالون يديرون كافة التفاصيل
CREATE POLICY "Admins manage booking details" ON public.booking_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            JOIN public.salons s ON s.id = b.salon_id
            JOIN public.profiles p ON p.id = auth.uid()
            WHERE b.id = booking_details.booking_id AND (s.owner_id = p.id OR p.role = 'cashier')
        )
    );

-- الفنان يرى تفاصيل الحجوزات المسندة إليه فقط
CREATE POLICY "Artists view assigned booking details" ON public.booking_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            JOIN public.staff s ON s.id = b.staff_id
            WHERE b.id = booking_details.booking_id AND s.profile_id = auth.uid()
        )
    );
