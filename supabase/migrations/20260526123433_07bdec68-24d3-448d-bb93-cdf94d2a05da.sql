
-- 1. Separate admin notes for group sessions
CREATE TABLE IF NOT EXISTS public.group_session_admin_notes (
  session_id uuid PRIMARY KEY,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.group_session_admin_notes (session_id, notes)
SELECT id, admin_notes FROM public.group_sessions WHERE admin_notes IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE public.group_session_admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage session notes"
ON public.group_session_admin_notes
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.group_sessions DROP COLUMN IF EXISTS admin_notes;

-- 2. Restrict course PDFs storage to purchasers
DROP POLICY IF EXISTS "Authenticated can read course pdfs" ON storage.objects;

CREATE POLICY "Purchasers can read course pdfs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'course-pdfs' AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.course_content cc
      JOIN public.purchases p ON p.product_id = cc.product_id
      WHERE p.user_id = auth.uid()
        AND p.status = 'completed'
        AND cc.downloadable_url IS NOT NULL
        AND (cc.downloadable_url = objects.name OR cc.downloadable_url LIKE '%/' || objects.name)
    )
  )
);

-- 3. Masterclass waitlist: unique email + require auth
DELETE FROM public.masterclass_waitlist a
USING public.masterclass_waitlist b
WHERE a.ctid < b.ctid AND lower(a.email) = lower(b.email);

CREATE UNIQUE INDEX IF NOT EXISTS masterclass_waitlist_email_unique
  ON public.masterclass_waitlist (lower(email));

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.masterclass_waitlist;

CREATE POLICY "Authenticated users can join waitlist"
ON public.masterclass_waitlist
FOR INSERT TO authenticated
WITH CHECK (email IS NOT NULL AND email <> '' AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- 4. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_payment_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_purchased(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_membership_eligible(uuid) FROM PUBLIC, anon;
