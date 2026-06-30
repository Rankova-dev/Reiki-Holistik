
-- Create group_sessions table
CREATE TABLE public.group_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  proposed_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 240,
  format TEXT NOT NULL DEFAULT 'online',
  status TEXT NOT NULL DEFAULT 'draft',
  jitsi_room_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin can manage group sessions"
ON public.group_sessions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Students see confirmed sessions for courses they purchased
CREATE POLICY "Students can view confirmed sessions for purchased courses"
ON public.group_sessions FOR SELECT
TO authenticated
USING (
  status = 'confirmed' AND
  has_purchased(auth.uid(), course_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_group_sessions_updated_at
BEFORE UPDATE ON public.group_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create group_session_attendance table
CREATE TABLE public.group_session_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  attended BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.group_session_attendance ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin can manage attendance"
ON public.group_session_attendance FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Students can view own attendance
CREATE POLICY "Students can view own attendance"
ON public.group_session_attendance FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Students can register attendance
CREATE POLICY "Students can register attendance"
ON public.group_session_attendance FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Students can update own attendance (cancel, etc.)
CREATE POLICY "Students can update own attendance"
ON public.group_session_attendance FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
