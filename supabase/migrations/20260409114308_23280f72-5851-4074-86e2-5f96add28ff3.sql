
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
    SELECT type, slug INTO _product_type, _product_slug
    FROM public.products WHERE id = NEW.product_id;

    INSERT INTO public.purchases (user_id, product_id, price_paid, status, product_type, granted_at)
    VALUES (NEW.user_id, NEW.product_id, NEW.amount, 'completed', _product_type::text, now())
    ON CONFLICT DO NOTHING;

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
$$;
