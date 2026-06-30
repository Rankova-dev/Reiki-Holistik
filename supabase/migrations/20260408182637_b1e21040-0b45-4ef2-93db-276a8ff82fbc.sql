
-- Fix admin storage policies: scope to authenticated instead of public
DROP POLICY IF EXISTS "Admins can delete course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload course videos" ON storage.objects;

CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);
