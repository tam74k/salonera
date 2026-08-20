-- 1. جدول أوقات العمل الأساسية (إذا لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS public.operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = الأحد
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(salon_id, day_of_week)
);

-- 2. جدول الأوقات المغلقة والإجازات الاستثنائية
CREATE TABLE IF NOT EXISTS public.blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE, -- إذا كان NULL يعني الإغلاق للصالون بالكامل
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. سياسات الأمان (RLS)
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for operating hours" ON public.operating_hours FOR SELECT USING (true);
CREATE POLICY "Admins manage operating hours" ON public.operating_hours FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = operating_hours.salon_id AND s.owner_id = auth.uid())
);

CREATE POLICY "Public read access for blocked times" ON public.blocked_times FOR SELECT USING (true);
CREATE POLICY "Admins manage blocked times" ON public.blocked_times FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons s WHERE s.id = blocked_times.salon_id AND s.owner_id = auth.uid())
);
