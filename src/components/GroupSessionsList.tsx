import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Video, MapPin, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const GroupSessionsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());

  // Update "now" every minute to track button activation
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["user-is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user,
  });

  // Fetch confirmed group sessions (RLS already filters by purchased courses)
  const { data: sessions = [] } = useQuery({
    queryKey: ["student-group-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_sessions")
        .select("*, products(name)")
        .eq("status", "confirmed")
        .order("proposed_datetime", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's attendance records
  const { data: myAttendance = [] } = useQuery({
    queryKey: ["my-attendance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_session_attendance")
        .select("*")
        .eq("user_id", user!.id)
        .is("cancelled_at", null);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const attendanceMap = Object.fromEntries(myAttendance.map((a: any) => [a.session_id, a]));

  const registerMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("group_session_attendance")
        .insert({ session_id: sessionId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      toast.success("¡Te has apuntado!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("group_session_attendance")
        .update({ cancelled_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-attendance"] });
      toast.success("Asistencia cancelada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (sessions.length === 0) {
    return (
      <p className="text-muted-foreground font-body text-sm py-6 text-center">
        No hay sesiones grupales programadas por el momento.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session: any, i: number) => {
        const sessionDate = new Date(session.proposed_datetime);
        const minutesUntil = (sessionDate.getTime() - now.getTime()) / 60_000;
        // Join button is always available once the session is confirmed (no advance window)
        const isJoinActive = minutesUntil > -(session.duration_minutes || 240);
        const isRegistered = !!attendanceMap[session.id];
        const isPast = minutesUntil < -(session.duration_minutes || 240);

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`border border-border/50 rounded-xl p-5 bg-background/80 backdrop-blur-sm ${isPast ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  session.format === "online" ? "bg-lavender/30" : "bg-earth/10"
                }`}>
                  {session.format === "online"
                    ? <Video className="w-4 h-4 text-lavender-deep" />
                    : <MapPin className="w-4 h-4 text-earth" />}
                </div>
                <div>
                  <h3 className="font-body text-sm font-medium">{session.title}</h3>
                  <p className="text-xs text-muted-foreground font-body">
                    {session.products?.name} · {sessionDate.toLocaleDateString("es-ES", {
                      weekday: "long", day: "numeric", month: "long",
                      hour: "2-digit", minute: "2-digit",
                    })} · {session.duration_minutes} min · {session.format}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Attendance button — admins don't need to register */}
                {!isPast && !isAdmin && (
                  isRegistered ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-body font-medium">
                        <UserCheck className="w-3 h-3" /> Apuntada ✓
                      </span>
                      <button
                        onClick={() => cancelMutation.mutate(session.id)}
                        className="text-xs text-muted-foreground font-body hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => registerMutation.mutate(session.id)}
                      disabled={registerMutation.isPending}
                      className="px-4 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent text-xs font-body font-medium transition-colors"
                    >
                      Apuntarme
                    </button>
                  )
                )}

                {/* Join button — admins can always join, students need 15min window */}
                {session.format === "online" && !isPast && (
                  <a
                    href={session.jitsi_room_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-full bg-earth-deep text-cream text-xs font-body font-medium hover:opacity-90 transition-opacity animate-pulse"
                  >
                    Unirse a la sesión
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GroupSessionsList;
