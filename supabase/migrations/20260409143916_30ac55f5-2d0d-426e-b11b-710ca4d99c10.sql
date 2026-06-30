
-- Fix the storage policy: video_url stores full URL, objects.name stores relative path
-- We need to compare objects.name with the path extracted from video_url
DROP POLICY IF EXISTS "Purchasers can view their course videos" ON storage.objects;

CREATE POLICY "Purchasers can view their course videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'course-videos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1
      FROM course_content cc
      JOIN purchases p ON p.product_id = cc.product_id
      WHERE p.user_id = auth.uid()
        AND p.status = 'completed'
        AND cc.video_url IS NOT NULL
        AND (
          cc.video_url = name
          OR cc.video_url LIKE '%/' || name
        )
    )
  )
);
