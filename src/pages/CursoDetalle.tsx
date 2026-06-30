import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Star, Crown } from "lucide-react";
import { useState } from "react";
import terapeutaImg from "@/assets/terapeuta.jpg";
import PaymentDialog from "@/components/PaymentDialog";
import { useAuth } from "@/hooks/useAuth";

const courseData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  includes: string[];
  audience: string[];
  benefits: string[];
  pricing: { label: string; price: string; perUnit?: string; note?: string; highlight?: boolean }[];
  timeline: { step: string; detail: string }[];
  faqs: { q: string; a: string }[];
}> = {
  "curso-completo": {
    title: "Curso Completo",
    subtitle: "Despertar de tu Maestría + Viaje hacia el Interior",
    description: "El viaje transformacional completo. 10 encuentros (uno mensual) que incluyen la certificación de Reiki en 3 niveles y la formación de los 7 chakras. Aprenderás a meditar, conocerás los chakras en profundidad, aprenderás a equilibrarlos y sanarlos. Incluye seguimiento por WhatsApp entre encuentros para un acompañamiento continuo.",
    includes: ["Certificación Reiki (3 niveles)", "Formación de los 7 chakras", "10 encuentros (uno mensual)", "Aprenderás a meditar", "Seguimiento por WhatsApp entre encuentros", "Material de apoyo descargable"],
    audience: ["Personas que buscan una transformación integral", "Quienes desean certificarse como terapeutas", "Quienes quieren un compromiso sostenido con su crecimiento"],
    benefits: ["Ahorro significativo respecto a cursos individuales", "Proceso completo y cohesionado", "Acompañamiento continuo por WhatsApp entre encuentros"],
    pricing: [
      { label: "Mensual", price: "80€", perUnit: "/mes" },
      { label: "Pago único", price: "700€", note: "Ahorras 100€", highlight: true },
    ],
    timeline: [
      { step: "Octubre", detail: "Reiki Nivel I — Encuentro 1" },
      { step: "Noviembre", detail: "Chakra 1 (Raíz) — Encuentro 2" },
      { step: "Diciembre", detail: "Chakra 2 (Sacro) — Encuentro 3" },
      { step: "Enero", detail: "Chakra 3 (Plexo Solar) — Encuentro 4" },
      { step: "Febrero", detail: "Reiki Nivel II — Encuentro 5" },
      { step: "Marzo", detail: "Chakra 4 (Corazón) — Encuentro 6" },
      { step: "Abril", detail: "Chakra 5 (Garganta) — Encuentro 7" },
      { step: "Mayo", detail: "Chakra 6 (Tercer Ojo) — Encuentro 8" },
      { step: "Junio", detail: "Chakra 7 (Corona) — Encuentro 9" },
      { step: "Julio", detail: "Reiki Nivel III — Encuentro 10" },
    ],
    faqs: [
      { q: "¿Necesito experiencia previa?", a: "No, el curso está diseñado para todos los niveles. Empezamos desde cero." },
      { q: "¿Las sesiones son online o presenciales?", a: "Principalmente online vía Jitsi Meet, con opción presencial en algunos encuentros clave." },
      { q: "¿Puedo pagar a plazos?", a: "Sí, ofrecemos la opción de pago mensual de 80€/mes." },
      { q: "¿Qué certificación obtengo?", a: "Certificación de Maestra/o de Reiki Usui (Niveles I, II y III)." },
    ],
  },
  "despertar-maestria": {
    title: "Despertar de tu Maestría",
    subtitle: "Curso de Reiki · 3 niveles",
    description: "Certificación completa de Reiki Usui en 3 niveles. 2 encuentros por nivel con pausas de 3 meses entre cada nivel para una integración profunda. Un viaje de autodescubrimiento y maestría energética.",
    includes: ["6 encuentros en total (2 por nivel)", "Manual de cada nivel", "Certificado oficial por nivel", "Prácticas supervisadas", "Seguimiento entre niveles"],
    audience: ["Personas que desean aprender Reiki desde cero", "Terapeutas que quieren ampliar su formación", "Cualquier persona interesada en el bienestar energético"],
    benefits: ["Certificación reconocida", "Ritmo respetuoso con periodos de integración de 3 meses", "Enfoque práctico y vivencial"],
    pricing: [
      { label: "Nivel I · 2 encuentros", price: "150€" },
      { label: "Nivel II · 2 encuentros", price: "200€" },
      { label: "Nivel III · 2 encuentros", price: "175€" },
      { label: "Pack completo (3 niveles)", price: "500€", note: "Ahorras 25€", highlight: true },
    ],
    timeline: [
      { step: "Nivel I", detail: "2 encuentros" },
      { step: "Pausa", detail: "3 meses de integración" },
      { step: "Nivel II", detail: "2 encuentros" },
      { step: "Pausa", detail: "3 meses de integración" },
      { step: "Nivel III", detail: "2 encuentros" },
    ],
    faqs: [
      { q: "¿Por qué hay pausas entre niveles?", a: "Los periodos de integración de 3 meses son fundamentales para asimilar cada nivel antes de avanzar al siguiente." },
      { q: "¿Puedo comprar solo un nivel?", a: "Sí, puedes comprar nivel por nivel o el pack completo con descuento." },
    ],
  },
  "viaje-interior": {
    title: "Viaje hacia el Interior",
    subtitle: "Curso de Chakras · 9 encuentros",
    description: "9 encuentros mensuales explorando en profundidad el sistema de chakras. Un viaje por los centros energéticos del cuerpo para comprender, equilibrar y potenciar tu energía vital.",
    includes: ["9 encuentros mensuales", "Material teórico y práctico", "Meditaciones guiadas", "Ejercicios para casa", "Comunidad de apoyo"],
    audience: ["Personas interesadas en el sistema de chakras", "Practicantes de yoga o meditación", "Terapeutas que desean profundizar en energía"],
    benefits: ["Comprensión profunda del sistema energético", "Herramientas prácticas para el día a día", "Transformación sostenida mes a mes"],
    pricing: [
      { label: "Mensual (9 meses)", price: "60€", perUnit: "/mes" },
      { label: "Pago único", price: "490€", note: "Ahorras 50€", highlight: true },
    ],
    timeline: [
      { step: "Mes 1", detail: "Chakra Raíz — Muladhara" },
      { step: "Mes 2", detail: "Chakra Sacro — Svadhisthana" },
      { step: "Mes 3", detail: "Chakra Plexo Solar — Manipura" },
      { step: "Mes 4", detail: "Chakra Corazón — Anahata" },
      { step: "Mes 5", detail: "Chakra Garganta — Vishuddha" },
      { step: "Mes 6", detail: "Chakra Tercer Ojo — Ajna" },
      { step: "Mes 7", detail: "Chakra Corona — Sahasrara" },
      { step: "Mes 8", detail: "Integración y equilibrio" },
      { step: "Mes 9", detail: "Maestría y cierre" },
    ],
    faqs: [
      { q: "¿Las sesiones son grupales?", a: "Preferentemente grupales. Si no se forma grupo, se ofrecen sesiones individuales." },
      { q: "¿Puedo incorporarme empezado el curso?", a: "Recomendamos empezar desde el inicio, pero consulta disponibilidad." },
    ],
  },
};

const CursoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const course = courseData[id || ""];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<{ label: string; amount: number } | null>(null);

  const productIdMap: Record<string, string> = {
    "curso-completo": "1794172d-5113-431d-b48a-a836025c567b",
    "despertar-maestria": "8c817c0b-fd90-4a92-b863-47102e3d2be7",
    "viaje-interior": "7158c001-d130-4682-980b-2d272ad5e0a5",
  };

  const handleInscription = (pricingLabel: string, amount: number) => {
    setSelectedPricing({ label: pricingLabel, amount });
    setPaymentOpen(true);
  };

  if (!course) {
    return (
      <div className="py-24 px-6 text-center">
        <h1 className="font-heading text-3xl mb-4">Curso no encontrado</h1>
        <Link to="/formacion" className="text-lavender-deep hover:underline font-body">← Volver a formación</Link>
      </div>
    );
  }

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/formacion" className="text-sm text-muted-foreground font-body hover:text-foreground mb-6 inline-block">
            ← Volver a formación
          </Link>

          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-2">{course.title}</h1>
          <p className="font-heading text-xl text-muted-foreground italic mb-8">{course.subtitle}</p>
          <p className="text-muted-foreground font-body font-light leading-relaxed mb-12">{course.description}</p>

          {(id === "despertar-maestria" || id === "curso-completo") && (
            <div className="mb-12 rounded-2xl border-2 border-golden/40 bg-earth-deep text-cream p-6 md:p-8 shadow-lg">
              <p className="text-xs font-body uppercase tracking-widest text-golden mb-2">Próximas fechas de inicio · Reiki Nivel I</p>
              <h3 className="font-heading text-2xl md:text-3xl font-light italic mb-4">Comienza tu camino en Reiki</h3>
              <p className="text-sm font-body text-cream/80 mb-6 leading-relaxed">
                El primer nivel de Reiki tiene <strong className="text-golden">dos fechas de inicio confirmadas</strong>. Elige la que mejor te convenga y reserva tu plaza con antelación.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-cream/10 border-2 border-golden/30 p-5 text-center">
                  <p className="text-[10px] font-body uppercase tracking-wider text-golden mb-2">Primera fecha</p>
                  <p className="font-heading text-3xl md:text-4xl font-medium">17 de mayo</p>
                </div>
                <div className="rounded-xl bg-cream/10 border-2 border-golden/30 p-5 text-center">
                  <p className="text-[10px] font-body uppercase tracking-wider text-golden mb-2">Segunda fecha</p>
                  <p className="font-heading text-3xl md:text-4xl font-medium">14 de junio</p>
                </div>
              </div>
              {id === "despertar-maestria" && (
                <button
                  onClick={() => handleInscription("Nivel I · 2 encuentros", 150)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-golden text-earth-deep font-body text-sm font-medium uppercase tracking-wider hover:bg-golden/90 transition-colors"
                >
                  Inscribirme al Nivel I →
                </button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-8">Estructura del curso</h2>
            <div className="space-y-4">
              {course.timeline.map((t, i) => (
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
              <ul className="space-y-2">{course.includes.map((i) => <li key={i} className="text-sm font-body text-muted-foreground">✦ {i}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium mb-3">Para quién es</h3>
              <ul className="space-y-2">{course.audience.map((a) => <li key={a} className="text-sm font-body text-muted-foreground">✦ {a}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-heading text-lg font-medium mb-3">Beneficios</h3>
              <ul className="space-y-2">{course.benefits.map((b) => <li key={b} className="text-sm font-body text-muted-foreground">✦ {b}</li>)}</ul>
            </div>
          </div>

          {/* Pricing — redesigned */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-8 text-center">Elige tu plan</h2>
            <div className={`grid gap-4 ${course.pricing.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-lg mx-auto' : course.pricing.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'}`}>
              {course.pricing.map((p) => {
                const amount = parseInt(p.price.replace(/[^0-9]/g, ""));
                return (
                <div
                  key={p.label}
                  className={`relative rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    p.highlight
                      ? "bg-earth-deep text-cream border-2 border-golden/40 shadow-lg scale-[1.02]"
                      : "bg-background border border-border/50 hover:border-lavender/50"
                  }`}
                  onClick={() => handleInscription(p.label, amount)}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-golden text-earth-deep text-[10px] font-body font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Recomendado
                    </span>
                  )}
                  <p className={`text-xs font-body mb-2 ${p.highlight ? "text-cream/70" : "text-muted-foreground"}`}>{p.label}</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <p className={`font-heading text-4xl font-medium ${p.highlight ? "text-cream" : "text-earth-deep"}`}>{p.price}</p>
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
                );
              })}
            </div>
          </div>

          {/* Instructor */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-6">Tu instructora</h2>
            <div className="bg-muted/30 rounded-2xl p-6 md:p-8 border border-border/50">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <img
                  src={terapeutaImg}
                  alt="Elisabet, Maestra de Reiki Usui"
                  className="w-28 h-28 rounded-full object-cover border-2 border-lavender/40 flex-shrink-0"
                />
                <div>
                  <p className="font-heading text-xl font-medium mb-1">Elisabet</p>
                  <p className="text-xs text-lavender-deep font-body font-medium uppercase tracking-wide mb-3">Maestra de Reiki Usui · Canalizadora y Médium</p>
                  <p className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-3">
                    Con más de 24 años de experiencia como terapeuta y Maestra de Reiki, Elisabet comenzó su camino espiritual en 1997 con el despertar de sus capacidades como canalizadora y médium. Se inició como terapeuta de Reiki en 2002 y se formó como Maestra de Reiki Usui Tradicional y Tibetano en 2011.
                  </p>
                  <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">
                    Su labor integra su sensibilidad como canalizadora junto con su recorrido como terapeuta y maestra, acompañando desde un enfoque cercano, respetuoso y profundamente humano.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-medium mb-6">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {course.faqs.map((faq, i) => (
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
              {Object.entries(courseData)
                .filter(([key]) => key !== id)
                .slice(0, 2)
                .map(([key, c]) => (
                  <Link
                    key={key}
                    to={`/formacion/curso/${key}`}
                    className="flex-1 bg-background border border-border/50 rounded-xl p-5 hover:border-lavender/50 transition-colors"
                  >
                    <h3 className="font-heading text-lg font-medium mb-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{c.subtitle}</p>
                  </Link>
                ))}
            </div>
          </div>
        </motion.div>
      </div>

      {selectedPricing && id && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          productId={productIdMap[id] || ""}
          productName={course.title}
          pricingOption={selectedPricing.label}
          amount={selectedPricing.amount}
        />
      )}
    </div>
  );
};

export default CursoDetalle;
