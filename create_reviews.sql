CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for own bookings" ON public.reviews FOR INSERT USING (
    auth.uid() = client_id AND 
    EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = booking_id AND b.client_id = auth.uid() AND b.status = 'completed'
        -- 24 hour limit logic can be handled in application layer or with a complex trigger, we will rely on app UI
    )
);

NOTIFY pgrst, 'reload schema';
