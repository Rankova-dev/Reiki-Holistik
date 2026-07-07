import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Star, Crown } from "lucide-react";
import { useState } from "react";
import terapeutaImg from "@/assets/terapeuta.jpg";
import PaymentDialog from "@/components/PaymentDialog";
import { useProduct, useProductsBySlug } from "@/hooks/useProducts";
import { useSiteContent } from "@/hooks/useSiteContent";
import { INSTRUCTOR_DEFAULT } from "@/lib/contentDefaults";

const COURSE_SLUGS = ["curso-completo", "despertar-maestria", "viaje-interior"];

const CursoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { product: course, isLoading } = useProduct(id);
  const { bySlug: otherCourses } = useProductsBySlug(COURSE_SLUGS);
  const { content: instructor } = useSiteContent("instructor", INSTRUCTOR_DEFAULT);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<{ label: string; amount: number } | null>(null);

  const handleInscription = (pricingLabel: string, amount: number) => {
    setSelectedPricing({ label: pricingLabel, amount });
    setPaymentOpen(true);
  };

  if (isLoading) {
    return <div className="py-24 text-center text-muted-foreground">Cargando...</div>;
  }

  if (!course || !COURSE_SLUGS.includes(course.slug)) {
    return (
      <div className="py-24 px-6 text-center">
        <h1 className="font-heading text-3xl mb-4">Curso no encontrado</h1>
        <Link to="/formacion" className="text-lavender-deep hover:underline font-body">← Volver a formación</Link>
      </div>
    );
  }

  const m = course.metadata;
  const promo = m.promo;

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/formacion" className="text-sm text-muted-foreground font-body hover:text-foreground mb-6 inline-block">
            ← Volver a formación
          </Link>

          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-2">{course.name}</h1>
          <p className="font-heading text-xl text-muted-foreground italic mb-8">{m.subtitle}</p>
          <p className="text-muted-foreground font-body font-light leading-relaxed mb-12">{course.description}</p>

          {promo?.enabled && (
            <div className="mb-12 rounded-2xl border-2 border-golden/40 bg-earth-deep text-cream p-6 md:p-8 shadow-lg">
              <p className="text-xs font-body uppercase tracking-widest text-golden mb-2">{promo.eyebrow}</p>
              <h3 className="font-heading text-2xl md:text-3xl font-light italic mb-4">{promo.title}</h3>
              <p className="text-sm font-body text-cream/80 mb-6 leading-relaxed">{promo.text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {promo.dates?.map((d) => (
                  <div key={d.label} className="rounded-xl bg-cream/10 border-2 border-golden/30 p-5 text-center">
                    <p className="text-[10px] font-body uppercase tracking-wider text-golden mb-2">{d.label}</p>
                    <p className="font-heading text-3xl md:text-4xl font-medium">{d.value}</p>
                  </div>
                ))}
              </div>
              {promo.cta_label && (
                <button
                  onClick={() => handleInscription(promo.cta_pricing_label || "", promo.cta_amount || 0)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-golden text-earth-deep font-body text-sm font-medium uppercase tracking-wider hover:bg-golden/90 transition-colors"
                >
                  {promo.cta_label}
                </button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-8">Estructura del curso</h2>
            <div className="space-y-4">
              {m.timeline?.map((t, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-20 flex-shrink-0 text-right">
                    <span className="font-heading text-sm font-medium text-lavender-deep">{t.step}</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-lavender border-2 border-lavender-deep mt-1.5 flex-shrink-0" />
                  <p className="font-body text-sm text-muted-foreground">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What's included */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div>
              <h3 className="font-heading text-lg font-medium mb-3">Qué incluye</h3>
              <ul className="space-y-2">{m.includes?.map((i) => <li key={i} className="text-sm font-body text-muted-foreground">✦ {i}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium mb-3">Para quién es</h3>
              <ul className="space-y-2">{m.audience?.map((a) => <li key={a} className="text-sm font-body text-muted-foreground">✦ {a}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium mb-3">Beneficios</h3>
              <ul className="space-y-2">{m.benefits?.map((b) => <li key={b} className="text-sm font-body text-muted-foreground">✦ {b}</li>)}</ul>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-8 text-center">Elige tu plan</h2>
            <div className={`grid gap-4 ${(m.pricing_options?.length || 0) <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-lg mx-auto' : m.pricing_options?.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'}`}>
              {m.pricing_options?.map((p) => (
                <div
                  key={p.label}
                  className={`relative rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    p.highlight
                      ? "bg-earth-deep text-cream border-2 border-golden/40 shadow-lg scale-[1.02]"
                      : "bg-background border border-border/50 hover:border-lavender/50"
                  }`}
                  onClick={() => handleInscription(p.label, p.amount)}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-golden text-earth-deep text-[10px] font-body font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Recomendado
                    </span>
                  )}
                  <p className={`text-xs font-body mb-2 ${p.highlight ? "text-cream/70" : "text-muted-foreground"}`}>{p.label}</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <p className={`font-heading text-4xl font-medium ${p.highlight ? "text-cream" : "text-earth-deep"}`}>{p.amount}€</p>
                    {p.perUnit && <span className={`text-sm font-body ${p.highlight ? "text-cream/60" : "text-muted-foreground"}`}>{p.perUnit}</span>}
                  </div>
                  {p.note && (
                    <p className={`text-xs font-body font-medium mt-2 flex items-center justify-center gap-1 ${p.highlight ? "text-golden" : "text-lavender-deep"}`}>
                      <Star className="w-3 h-3" /> {p.note}
                    </p>
                  )}
                  <p className={`text-xs font-body mt-3 ${p.highlight ? "text-cream/60" : "text-muted-foreground"}`}>
                    Haz clic para inscribirte →
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-6">Tu instructora</h2>
            <div className="bg-muted/30 rounded-2xl p-6 md:p-8 border border-border/50">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <img
                  src={instructor.image_url || terapeutaImg}
                  alt={`${instructor.name}, Maestra de Reiki Usui`}
                  className="w-28 h-28 rounded-full object-cover border-2 border-lavender/40 flex-shrink-0"
                />
                <div>
                  <p className="font-heading text-xl font-medium mb-1">{instructor.name}</p>
                  <p className="text-xs text-lavender-deep font-body font-medium uppercase tracking-wide mb-3">{instructor.title}</p>
                  {instructor.bio_short.map((p, i) => (
                    <p key={i} className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-3 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-6">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {m.faqs?.map((faq, i) => (
                <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left font-body text-sm font-medium hover:bg-muted/30 transition-colors"
                  >
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground font-body font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div>
            <h2 className="font-heading text-2xl font-medium mb-4">Otros cursos</h2>
            <div className="flex gap-4">
              {Object.values(otherCourses)
                .filter((c) => c.slug !== course.slug)
                .slice(0, 2)
                .map((c) => (
                  <Link
                    key={c.slug}
                    to={`/formacion/curso/${c.slug}`}
                    className="flex-1 bg-background border border-border/50 rounded-xl p-5 hover:border-lavender/50 transition-colors"
                  >
                    <h3 className="font-heading text-lg font-medium mb-1">{c.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">{c.metadata.subtitle}</p>
                  </Link>
                ))}
            </div>
          </div>
        </motion.div>
      </div>

      {selectedPricing && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          productId={course.id}
          productName={course.name}
          pricingOption={selectedPricing.label}
          amount={selectedPricing.amount}
        />
      )}
    </div>
  );
};

export default CursoDetalle;
