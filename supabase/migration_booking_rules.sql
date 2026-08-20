-- 1. دالة التحقق من توفر الوقت وعدم التعارض (Double Booking & Blocked Times)
CREATE OR REPLACE FUNCTION public.check_booking_availability()
RETURNS TRIGGER AS $$
DECLARE
    salon_max_bookings INT;
    existing_bookings_count INT;
BEGIN
    -- إذا كان الحجز ملغياً، فلا داعي للتحقق
    IF NEW.status = 'canceled' THEN
        RETURN NEW;
    END IF;

    -- 1. التحقق مما إذا كان الوقت يقع ضمن الأوقات المغلقة (Blocked Times) أو الإجازات
    IF EXISTS (
        SELECT 1 FROM public.blocked_times
        WHERE salon_id = NEW.salon_id
          AND (staff_id IS NULL OR staff_id = NEW.staff_id)
          AND (NEW.booking_date + NEW.booking_time) BETWEEN start_datetime AND end_datetime
    ) THEN
        RAISE EXCEPTION 'هذا الوقت غير متاح للحجز بسبب إجازة أو إغلاق محدد من قبل الإدارة.';
    END IF;

    -- 2. التحقق من عدم حجز نفس الفني في نفس الوقت (إذا لم يكن "غير محدد")
    IF NEW.staff_id IS NOT NULL THEN
        SELECT count(*) INTO existing_bookings_count
        FROM public.bookings
        WHERE salon_id = NEW.salon_id
          AND staff_id = NEW.staff_id
          AND booking_date = NEW.booking_date
          AND booking_time = NEW.booking_time
          AND status != 'canceled'
          AND id != NEW.id; -- استثناء الحجز الحالي في حالة التحديث

        IF existing_bookings_count > 0 THEN
            RAISE EXCEPTION 'الفني المختار محجوز بالفعل في هذا الوقت. يرجى اختيار وقت آخر.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. إنشاء الـ Trigger الذي يعمل قبل كل عملية إدخال أو تحديث على جدول الحجوزات
DROP TRIGGER IF EXISTS prevent_double_booking ON public.bookings;
CREATE TRIGGER prevent_double_booking
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE PROCEDURE public.check_booking_availability();
