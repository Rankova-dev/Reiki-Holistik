
-- Add missing UPDATE policy for course-videos (admin only)
CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow users to delete their own payment proof files
CREATE POLICY "Users can delete own payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
