
-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', true);

-- Public read access (videos are accessed via signed URLs or public URLs)
CREATE POLICY "Anyone can view course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- Only admins can upload
CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-videos' AND public.has_role(auth.uid(), 'admin'));
