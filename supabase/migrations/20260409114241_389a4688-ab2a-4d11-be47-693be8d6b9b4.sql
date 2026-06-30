
-- 1. session_credits table
CREATE TABLE public.session_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  used_at TIMESTAMP WITH TIME ZONE,
  booking_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.session_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.session_credits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can manage credits" ON public.session_credits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. monthly_booking_limits table
CREATE TABLE public.monthly_booking_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('pack', 'membership')),
  month TEXT NOT NULL, -- YYYY-MM
  bookings_used INTEGER NOT NULL DEFAULT 0,
  max_bookings INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_type, month)
);

ALTER TABLE public.monthly_booking_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own limits" ON public.monthly_booking_limits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can manage limits" ON public.monthly_booking_limits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert limits" ON public.monthly_booking_limits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update limits" ON public.monthly_booking_limits
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 3. Add format to payment_requests
ALTER TABLE public.payment_requests ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'online';

-- 4. Add columns to purchases
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS product_type TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 5. Add columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS jitsi_room_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS picktime_booking_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'individual';

-- 6. Function to check membership eligibility
CREATE OR REPLACE FUNCTION public.check_membership_eligible(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- All 4 pack credits used
    SELECT 1 FROM public.session_credits sc
    JOIN public.products p ON sc.product_id = p.id
    WHERE sc.user_id = _user_id
      AND p.slug = 'pack-4-sesiones'
      AND sc.status = 'used'
    HAVING COUNT(*) >= 4
  )
  OR EXISTS (
    -- Has any active course purchase
    SELECT 1 FROM public.purchases pu
    JOIN public.products p ON pu.product_id = p.id
    WHERE pu.user_id = _user_id
      AND pu.status = 'completed'
      AND p.type = 'course'
  )
$$;

-- 7. Updated payment approval trigger to handle session credits
CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _product_type TEXT;
  _product_slug TEXT;
  _credit_count INTEGER;
  _i INTEGER;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get product info
    SELECT type, slug INTO _product_type, _product_slug
    FROM public.products WHERE id = NEW.product_id;

    -- Create purchase record
    INSERT INTO public.purchases (user_id, product_id, price_paid, status, product_type, granted_at)
    VALUES (NEW.user_id, NEW.product_id, NEW.amount, 'completed', _product_type::text, now())
    ON CONFLICT DO NOTHING;

    -- Create session credits for session products
    IF _product_slug = 'sesion-individual' THEN
      _credit_count := 1;
    ELSIF _product_slug = 'pack-4-sesiones' THEN
      _credit_count := 4;
    ELSE
      _credit_count := 0;
    END IF;

    FOR _i IN 1.._credit_count LOOP
      INSERT INTO public.session_credits (user_id, product_id, status)
      VALUES (NEW.user_id, NEW.product_id, 'available');
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_payment_approval ON public.payment_requests;
CREATE TRIGGER on_payment_approval
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payment_approval();

-- Enable realtime for session_credits
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_credits;
