
DROP POLICY "Anyone can join waitlist" ON public.masterclass_waitlist;
CREATE POLICY "Anyone can join waitlist" ON public.masterclass_waitlist 
  FOR INSERT 
  WITH CHECK (email IS NOT NULL AND email <> '');
