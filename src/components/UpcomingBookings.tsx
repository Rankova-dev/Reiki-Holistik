import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Video, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const UpcomingBookings = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());

  // Update "now" every minute for the 15-min activation check
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ["upcoming-bookings", user?.id],
    queryFn: () => api.myBookings(),
    enabled: !!user,
  });

  if (!user || bookings.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="font-heading text-2xl font-medium mb-6">Próximas sesiones</h2>
      <div className="space-y-3">
        {bookings.map((b: any) => {
          const startTime = new Date(b.start_time);
          const minutesUntil = (startTime.getTime() - now.getTime()) / 60000;
          const isActive = minutesUntil <= 15 && minutesUntil > -(b.duration_minutes || 60);
          const isOnline = b.modality === "online";

          return (
            <div key={b.id} className="bg-background border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-lavender/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-lavender-deep" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium">
                    {b.service_type === "individual" ? "Sesión individual" : b.service_type}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {startTime.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {startTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1">
                      {isOnline ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {isOnline ? "Online" : "Presencial"}
                    </span>
                  </div>
                </div>
              </div>

              {isOnline && b.jitsi_room_url && (
                <div>
                  {isActive ? (
                    <a
                      href={b.jitsi_room_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-earth-deep text-cream rounded-full font-body text-xs font-medium hover:opacity-90 transition-opacity animate-pulse"
                    >
                      Unirse a la sesión
                    </a>
                  ) : (
                    <span className="px-5 py-2.5 bg-muted text-muted-foreground rounded-full font-body text-xs">
                      Disponible 15 min antes
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingBookings;
