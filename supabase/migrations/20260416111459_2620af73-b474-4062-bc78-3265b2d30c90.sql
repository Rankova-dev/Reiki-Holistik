
CREATE OR REPLACE FUNCTION public.handle_payment_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _product_type TEXT;
  _product_slug TEXT;
  _credit_count INTEGER;
  _i INTEGER;
  _is_monthly BOOLEAN;
  _expires_at TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    SELECT type, slug INTO _product_type, _product_slug
    FROM public.products WHERE id = NEW.product_id;

    -- Check if this is a monthly payment
    _is_monthly := (NEW.pricing_option ILIKE '%mensual%');
    
    IF _is_monthly THEN
      _expires_at := now() + interval '1 month';
    ELSE
      _expires_at := NULL;
    END IF;

    -- For monthly renewals, update existing purchase expires_at instead of inserting new
    IF _is_monthly AND EXISTS (
      SELECT 1 FROM public.purchases 
      WHERE user_id = NEW.user_id 
        AND product_id = NEW.product_id 
        AND status = 'completed'
    ) THEN
      UPDATE public.purchases
      SET expires_at = _expires_at, granted_at = now()
      WHERE user_id = NEW.user_id 
        AND product_id = NEW.product_id 
        AND status = 'completed';
    ELSE
      INSERT INTO public.purchases (user_id, product_id, price_paid, status, product_type, granted_at, expires_at)
      VALUES (NEW.user_id, NEW.product_id, NEW.amount, 'completed', _product_type::text, now(), _expires_at)
      ON CONFLICT DO NOTHING;
    END IF;

    IF _product_slug IN ('sesion-online', 'sesion-presencial') THEN
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
$function$;
