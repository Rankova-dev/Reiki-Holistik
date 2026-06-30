
-- Drop the current suffix-matching policy
DROP POLICY IF EXISTS "Purchasers can view their course videos" ON storage.objects;

-- Recreate with exact path matching
CREATE POLICY "Purchasers can view their course videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND (
    has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.course_content cc
      JOIN public.purchases p ON p.product_id = cc.product_id
      WHERE p.user_id = auth.uid()
        AND p.status = 'completed'
        AND cc.video_url IS NOT NULL
        AND cc.video_url = name
    )
  )
);
