
-- 1. Fix overly broad course-videos storage policy
DROP POLICY IF EXISTS "Authenticated users can view purchased course videos" ON storage.objects;

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
      FROM public.purchases p
      JOIN public.course_content cc ON cc.product_id = p.product_id
      WHERE p.user_id = auth.uid()
      AND p.status = 'completed'
      AND cc.video_url IS NOT NULL
    )
  )
);

-- 2. Split user_roles ALL policy into explicit per-operation policies
DROP POLICY IF EXISTS "Admin can manage roles" ON public.user_roles;

CREATE POLICY "Admin can select roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add admin storage policies for payment-proofs management
CREATE POLICY "Admins can manage payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);
