
INSERT INTO storage.buckets (id, name, public) VALUES ('course-pdfs', 'course-pdfs', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Admins manage course pdfs" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'course-pdfs' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'course-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can read course pdfs" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'course-pdfs');
