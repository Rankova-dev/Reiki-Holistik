
-- 1. Remove session_credits from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.session_credits;

-- 2. Add unique constraint on waitlist email
ALTER TABLE public.masterclass_waitlist ADD CONSTRAINT masterclass_waitlist_email_unique UNIQUE (email);

-- 3. Remove user INSERT/UPDATE policies on monthly_booking_limits
DROP POLICY IF EXISTS "System can insert limits" ON public.monthly_booking_limits;
DROP POLICY IF EXISTS "System can update limits" ON public.monthly_booking_limits;

-- 4. Add validation trigger to enforce max_bookings <= 2
CREATE OR REPLACE FUNCTION public.validate_booking_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.max_bookings > 2 THEN
    NEW.max_bookings := 2;
  END IF;
  IF NEW.bookings_used < 0 THEN
    NEW.bookings_used := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_booking_limits
BEFORE INSERT OR UPDATE ON public.monthly_booking_limits
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_limits();
