import { motion } from "framer-motion";
import { Calendar, Lock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import GroupSessionsList from "@/components/GroupSessionsList";
import UpcomingBookings from "@/components/UpcomingBookings";

const PICKTIME_URL = "https://www.picktime.com/6fe01a53-d09d-444c-9ae1-7ad7913020ad";

const Calendario = () => {
  const { user } = useAuth();

  const { data: purchases = [] } = useQuery({
    queryKey: ["calendar-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*, products(*)")
        .eq("user_id", user!.id)
        .eq("status", "completed");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get session credits
  const { data: credits = [] } = useQuery({
    queryKey: ["calendar-credits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_credits")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "available");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const hasCourseAccess = purchases.some((p: any) => p.products?.type === "course");
  const hasSessionAccess = credits.length > 0 || purchases.some((p: any) => p.products?.type === "membership");

  if (!user) {
    return (
      <div className="py-24 px-6 text-center min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-light mb-4">Calendario de sesiones</h1>
          <p className="text-muted-foreground font-body font-light mb-8 max-w-md mx-auto">
            Inicia sesión para ver tus sesiones disponibles.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-4 text-center">
            Calendario
          </h1>
          <p className="text-center text-muted-foreground font-body font-light mb-12">
            Consulta y reserva tus sesiones
          </p>

          {/* Upcoming bookings */}
          <UpcomingBookings />

          {/* Picktime booking section */}
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-medium mb-6">Reservar sesión individual</h2>
            {hasSessionAccess ? (
              <div className="bg-cream border border-sand/50 rounded-2xl overflow-hidden">
                <iframe
                  src={PICKTIME_URL}
                  width="100%"
                  className="min-h-[700px] md:min-h-[700px] sm:min-h-[900px]"
                  style={{ border: "none", minHeight: "700px" }}
                  title="Reservar sesión"
                />
              </div>
            ) : (
              <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 text-center">
                <p className="text-muted-foreground font-body font-light mb-4">
                  No tienes sesiones disponibles. Adquiere un servicio para poder reservar.
                </p>
                <Link
                  to="/sesiones"
                  className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Ver servicios
                </Link>
              </div>
            )}
          </section>

          {/* Group sessions */}
          {hasCourseAccess && (
            <>
              <h2 className="font-heading text-2xl font-medium mb-6">Sesiones grupales</h2>
              <GroupSessionsList />
            </>
          )}

          {!hasCourseAccess && !hasSessionAccess && (
            <div className="text-center mt-8">
              <Link
                to="/formacion"
                className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Explorar formaciones
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Calendario;
