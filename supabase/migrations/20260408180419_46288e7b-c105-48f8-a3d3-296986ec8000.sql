
-- 1. Remove the user INSERT policy on purchases to prevent self-granting access
DROP POLICY IF EXISTS "Users can create own purchases" ON public.purchases;

-- 2. Make course-videos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'course-videos';

-- 3. Remove any public SELECT policy on course-videos storage
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view course videos" ON storage.objects;

-- 4. Add storage policy so only purchasers can access course videos (via signed URLs)
CREATE POLICY "Authenticated users can view purchased course videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND (
    has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE p.user_id = auth.uid()
      AND p.status = 'completed'
    )
  )
);

-- 5. Add email format validation on masterclass_waitlist
ALTER TABLE public.masterclass_waitlist
  ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$');
