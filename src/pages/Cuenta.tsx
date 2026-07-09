import { motion } from "framer-motion";
import { User, CreditCard, Calendar, Bell, LogOut, Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import UpcomingBookings from "@/components/UpcomingBookings";

const Cuenta = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch payment requests (solicitudes)
  const { data: requests = [] } = useQuery({
    queryKey: ["my-requests", user?.id],
    queryFn: () => api.myPaymentRequests(),
    enabled: !!user,
  });

  // Fetch session credits
  const { data: credits = [] } = useQuery({
    queryKey: ["my-credits", user?.id],
    queryFn: () => api.mySessionCredits(),
    enabled: !!user,
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ["my-purchases-cuenta", user?.id],
    queryFn: () => api.myPurchases(),
    enabled: !!user,
  });

  // Fetch monthly booking limits
  const { data: monthlyLimits = [] } = useQuery({
    queryKey: ["my-monthly-limits", user?.id],
    queryFn: () => api.myMonthlyLimit(new Date().toISOString().slice(0, 7)),
    enabled: !!user,
  });

  const availableCredits = credits.filter((c: any) => c.status === "available").length;
  const totalCredits = credits.length;
  const usedCredits = credits.filter((c: any) => c.status === "used").length;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> En revisión
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Aprobado
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl font-light italic text-lavender-deep mb-10">Mi cuenta</h1>

          {/* Profile */}
          <section className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading text-xl font-medium">
                  {user?.name || "Usuario"}
                </p>
                <p className="text-sm text-muted-foreground font-body">{user?.email}</p>
              </div>
            </div>
          </section>


          {/* Upcoming bookings */}
          <section className="mb-6">
            <UpcomingBookings />
          </section>

          {/* Session credits summary */}
          {totalCredits > 0 && (
            <section className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-lavender-deep" />
                <h2 className="font-heading text-lg font-medium">Créditos de sesión</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-lavender/10 rounded-lg p-4">
                  <p className="font-heading text-2xl font-medium text-lavender-deep">{availableCredits}</p>
                  <p className="text-xs text-muted-foreground font-body">Disponibles</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-heading text-2xl font-medium">{usedCredits}</p>
                  <p className="text-xs text-muted-foreground font-body">Usados</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-heading text-2xl font-medium">{totalCredits}</p>
                  <p className="text-xs text-muted-foreground font-body">Total</p>
                </div>
              </div>
              {monthlyLimits.length > 0 && (
                <div className="mt-4 text-sm font-body text-muted-foreground">
                  Sesiones este mes: {monthlyLimits[0]?.bookings_used || 0} de {monthlyLimits[0]?.max_bookings || 2}
                </div>
              )}
            </section>
          )}

          {/* Active subscriptions / purchases */}
          <section className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-lavender-deep" />
              <h2 className="font-heading text-lg font-medium">Accesos activos</h2>
            </div>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body font-light">No hay compras activas</p>
            ) : (
              <div className="space-y-3">
                {purchases.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-body font-medium">{p.products?.name}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        Activado el {new Date(p.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Activo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Payment requests / Solicitudes */}
          <section className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-lavender-deep" />
              <h2 className="font-heading text-lg font-medium">Mis solicitudes</h2>
            </div>
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body font-light">No hay solicitudes de pago</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req: any) => (
                  <div key={req.id} className="py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-body font-medium">{req.products?.name || req.pricing_option}</p>
                      {statusBadge(req.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(req.created_at).toLocaleDateString("es-ES", {
                          day: "numeric", month: "short", year: "numeric"
                        })} · {req.amount}€
                      </p>
                      {req.status === "rejected" && (
                        <a
                          href="https://wa.me/34600000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline font-body"
                        >
                          <MessageCircle className="w-3 h-3" /> Contactar
                        </a>
                      )}
                    </div>
                    {req.status === "pending" && (
                      <p className="text-xs text-amber-600 font-body mt-1">
                        Revisaremos tu solicitud en un plazo de 24-48h y te notificaremos por email.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground font-body hover:text-foreground transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Cuenta;
