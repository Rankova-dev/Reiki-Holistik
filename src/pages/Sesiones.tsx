import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import PaymentDialog from "@/components/PaymentDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useProductsBySlug, type Product } from "@/hooks/useProducts";
import { SESIONES_DEFAULT, type SesionCard, type SesionOption } from "@/lib/contentDefaults";
import { getIcon } from "@/lib/iconMap";

const PICKTIME_URL = "https://www.picktime.com/6fe01a53-d09d-444c-9ae1-7ad7913020ad";

function resolveOption(bySlug: Record<string, Product>, opt: SesionOption) {
  const product = bySlug[opt.slug];
  if (!product) return { productId: "", price: 0 };
  if (opt.pricingLabel) {
    const tier = product.metadata.pricing_options?.find((p) => p.label === opt.pricingLabel);
    if (tier) return { productId: product.id, price: tier.amount };
  }
  return { productId: product.id, price: product.price };
}

const Sesiones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { content } = useSiteContent("sesiones", SESIONES_DEFAULT);
  const slugs = Array.from(new Set(content.cards.flatMap((c) => c.options.map((o) => o.slug))));
  const { bySlug } = useProductsBySlug(slugs);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string; name: string; option: string; amount: number;
  } | null>(null);
  const [infoModal, setInfoModal] = useState<{ title: string; message: string; action?: { label: string; productId: string; name: string; option: string; amount: number } } | null>(null);

  // Check membership eligibility
  const { data: membershipEligibleResult } = useQuery({
    queryKey: ["membership-eligible", user?.id],
    queryFn: () => api.membershipEligible(),
    enabled: !!user,
  });
  const membershipEligible = membershipEligibleResult?.eligible ?? false;

  // Get session credits
  const { data: credits = [] } = useQuery({
    queryKey: ["session-credits", user?.id],
    queryFn: () => api.mySessionCredits(),
    enabled: !!user,
  });

  // Get purchases for membership check
  const { data: purchases = [] } = useQuery({
    queryKey: ["session-purchases", user?.id],
    queryFn: () => api.myPurchases(),
    enabled: !!user,
  });

  // Get monthly booking limits
  const { data: monthlyLimits = [] } = useQuery({
    queryKey: ["session-monthly-limits", user?.id],
    queryFn: () => api.myMonthlyLimit(new Date().toISOString().slice(0, 7)),
    enabled: !!user,
  });

  // Get last booking for 15-day gap check
  const { data: myBookingsForGap = [] } = useQuery({
    queryKey: ["last-booking", user?.id],
    queryFn: () => api.myBookings(true),
    enabled: !!user,
  });
  const lastBooking = [...myBookingsForGap].sort((a: any, b: any) => b.start_time.localeCompare(a.start_time))[0] || null;

  const availableCredits = credits.filter((c: any) => c.status === "available").length;

  // Individual credits (from individual sessions)
  const individualCredits = credits.filter(
    (c: any) => c.status === "available" && ["sesion-online", "sesion-presencial"].includes(c.products?.slug)
  ).length;

  // Pack credits
  const packCredits = credits.filter(
    (c: any) => c.status === "available" && c.products?.slug === "pack-4-sesiones"
  ).length;

  // Active membership
  const hasActiveMembership = purchases.some(
    (p: any) => p.products?.type === "membership"
  );

  const handlePurchase = (productId: string, name: string, option: string, amount: number) => {
    setSelectedProduct({ id: productId, name, option, amount });
    setPaymentOpen(true);
  };

  const handleBookingClick = (card: SesionCard, optLabel: string, opt: { price: number; productId: string }) => {
    const serviceType = card.serviceType;

    // Step 1: Check auth
    if (!user) {
      navigate("/auth");
      return;
    }

    // Step 2: Check credits/purchase
    if (serviceType === "individual") {
      if (individualCredits > 0) {
        window.open(PICKTIME_URL, "_blank");
      } else {
        setInfoModal({
          title: "Sesión no disponible",
          message: "Para reservar una sesión individual necesitas adquirirla primero.",
          action: { label: "Contratar ahora", productId: opt.productId, name: card.title, option: optLabel, amount: opt.price },
        });
      }
    } else if (serviceType === "pack") {
      if (packCredits > 0) {
        window.open(PICKTIME_URL, "_blank");
      } else {
        setInfoModal({
          title: "Pack no disponible",
          message: "Para reservar necesitas adquirir el pack de 4 sesiones primero.",
          action: { label: "Contratar ahora", productId: opt.productId, name: card.title, option: optLabel, amount: opt.price },
        });
      }
    } else if (serviceType === "membership") {
      if (hasActiveMembership) {
        // Check monthly limits
        const currentLimit = monthlyLimits[0];
        const bookingsUsed = currentLimit?.bookings_used || 0;
        const maxBookings = currentLimit?.max_bookings || 2;

        if (bookingsUsed >= maxBookings) {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          setInfoModal({
            title: "Límite mensual alcanzado",
            message: `Has alcanzado el límite de 2 sesiones este mes. Próxima sesión disponible el ${nextMonth.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}.`,
          });
          return;
        }

        // Check 15-day gap
        if (lastBooking?.start_time) {
          const lastDate = new Date(lastBooking.start_time);
          const nextAvailable = new Date(lastDate.getTime() + 15 * 24 * 60 * 60 * 1000);
          if (new Date() < nextAvailable) {
            setInfoModal({
              title: "Espera entre sesiones",
              message: `Tu próxima sesión estará disponible a partir del ${nextAvailable.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}.`,
            });
            return;
          }
        }

        window.open(PICKTIME_URL, "_blank");
      } else if (membershipEligible) {
        setInfoModal({
          title: "Membresía disponible",
          message: "Ya puedes acceder a la membresía. Adquiérela para empezar.",
          action: { label: "Contratar membresía", productId: opt.productId, name: card.title, option: optLabel, amount: opt.price },
        });
      } else {
        setInfoModal({
          title: "Membresía bloqueada",
          message: "La membresía es de acceso exclusivo. Completa el pack de 4 sesiones o adquiere cualquier formación para desbloquearla.",
        });
      }
    }
  };

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-4 text-center">
            {content.title}
          </h1>
          <p className="text-center text-muted-foreground font-body font-light mb-16 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Credits summary */}
        {user && availableCredits > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-lavender/10 border border-lavender/30 rounded-xl p-5 flex items-center gap-4 max-w-md mx-auto"
          >
            <CreditCard className="w-6 h-6 text-lavender-deep flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Sesiones disponibles: {availableCredits}</p>
              <p className="text-xs text-muted-foreground font-body">
                Reserva tus sesiones desde el <a href="/formacion/calendario" className="text-lavender-deep hover:underline">calendario</a>
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.cards.map((card, i) => {
            const Icon = getIcon(card.icon);
            const locked = card.serviceType === "membership" && !membershipEligible;
            const badge = card.serviceType === "membership"
              ? (membershipEligible ? card.badgeUnlocked : card.badgeLocked)
              : card.badge;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative bg-background/80 backdrop-blur-sm border rounded-xl p-8 flex flex-col ${
                  locked ? "border-sand/80 opacity-90" : "border-border/50"
                }`}
              >
                {badge && (
                  <span className={`absolute -top-3 left-6 px-3 py-1 text-xs font-body font-medium rounded-full ${
                    locked ? "bg-sand text-earth-deep" : "bg-lavender text-earth-deep"
                  }`}>
                    {badge}
                  </span>
                )}
                <Icon className="w-8 h-8 text-lavender-deep mb-4" />
                <h3 className="font-heading text-2xl font-medium mb-4">{card.title}</h3>
                <p className="text-muted-foreground font-body font-light text-sm mb-6 flex-1">{card.desc}</p>

                {locked ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-body text-center">
                      Completa el pack de 4 sesiones o adquiere cualquier formación para desbloquear.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {card.options.map((opt) => {
                      const resolved = resolveOption(bySlug, opt);
                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleBookingClick(card, opt.label, resolved)}
                          className="w-full flex items-center justify-between py-3 px-4 bg-earth-deep text-cream rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <span>{card.buttonLabel} · {opt.label}</span>
                          <span>{resolved.price}€</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          pricingOption={selectedProduct.option}
          amount={selectedProduct.amount}
        />
      )}

      {/* Info modal */}
      <Dialog open={!!infoModal} onOpenChange={() => setInfoModal(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <h3 className="font-heading text-xl font-medium mb-3">{infoModal?.title}</h3>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">{infoModal?.message}</p>
            {infoModal?.action && (
              <button
                onClick={() => {
                  const a = infoModal.action!;
                  setInfoModal(null);
                  handlePurchase(a.productId, a.name, a.option, a.amount);
                }}
                className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {infoModal.action.label}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sesiones;
