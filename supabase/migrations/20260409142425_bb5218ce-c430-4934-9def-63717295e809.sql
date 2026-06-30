
-- Add admin role to the two authorized users (keeping their existing 'user' role)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN ('betyriudols@gmail.com', 'albert.diaz@alumni.mondragon.edu')
ON CONFLICT (user_id, role) DO NOTHING;
