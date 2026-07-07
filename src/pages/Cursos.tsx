import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, BookOpen, Lock, Mail } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useProductsBySlug } from "@/hooks/useProducts";
import { CURSOS_PAGE_DEFAULT } from "@/lib/contentDefaults";

const Cursos = () => {
  const { content: page } = useSiteContent("cursos_page", CURSOS_PAGE_DEFAULT);
  const { bySlug } = useProductsBySlug([
    "curso-completo", "despertar-maestria", "viaje-interior", "membresia-online", "membresia-presencial",
  ]);

  const cursoCompleto = bySlug["curso-completo"];
  const despertarMaestria = bySlug["despertar-maestria"];
  const viajeInterior = bySlug["viaje-interior"];
  const membresiaOnline = bySlug["membresia-online"];
  const membresiaPresencial = bySlug["membresia-presencial"];

  if (!cursoCompleto || !despertarMaestria || !viajeInterior) {
    return <div className="py-24 text-center text-muted-foreground">Cargando...</div>;
  }

  const cursoCompletoPricing = cursoCompleto.metadata.pricing_options || [];
  const despertarPricing = despertarMaestria.metadata.pricing_options || [];
  const viajePricing = viajeInterior.metadata.pricing_options || [];

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-4 text-center">
            {page.title}
          </h1>
          <p className="text-center text-muted-foreground font-body font-light mb-16 max-w-2xl mx-auto">
            {page.subtitle}
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Curso Completo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-earth-deep text-cream rounded-xl p-8 md:p-10 border border-earth"
          >
            {cursoCompleto.metadata.badge && (
              <span className="absolute -top-3 left-6 px-4 py-1 bg-lavender text-earth-deep text-xs font-body font-medium rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> {cursoCompleto.metadata.badge}
              </span>
            )}
            <h2 className="font-heading text-3xl font-medium mb-2">{cursoCompleto.name}</h2>
            <p className="font-heading text-lg italic text-cream/80 mb-4">{cursoCompleto.metadata.subtitle}</p>
            <p className="font-body font-light text-cream/70 text-sm mb-6 max-w-2xl">
              {cursoCompleto.description}
            </p>
            <div className="flex flex-wrap gap-6 mb-6">
              {cursoCompletoPricing.map((p) => (
                <div key={p.label}>
                  <p className="text-sm text-cream/60 font-body">{p.label}</p>
                  <p className="font-heading text-2xl">
                    {p.amount}€{p.perUnit}
                    {p.note && <span className="text-sm text-cream/60 font-body"> {p.note}</span>}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/formacion/curso/curso-completo"
              className="inline-block px-8 py-3 bg-cream text-earth-deep rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Comenzar el proceso
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reiki — Despertar de tu Maestría */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-8"
            >
              <Sparkles className="w-8 h-8 text-lavender-deep mb-4" />
              <h2 className="font-heading text-2xl font-medium mb-2">{despertarMaestria.name}</h2>
              <p className="text-sm font-body italic text-muted-foreground mb-4">{despertarMaestria.metadata.subtitle}</p>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">
                {despertarMaestria.description}
              </p>

              <div className="space-y-3 mb-6 text-sm font-body">
                {despertarPricing.map((p) => (
                  <div
                    key={p.label}
                    className={`flex justify-between items-center py-2 px-3 rounded-lg ${p.highlight ? "bg-lavender/20" : "border-b border-border/30"}`}
                  >
                    <span className={p.highlight ? "font-medium" : ""}>{p.label}</span>
                    <span className={`font-heading text-lg ${p.highlight ? "text-lavender-deep" : "text-earth"}`}>{p.amount}€</span>
                  </div>
                ))}
              </div>

              <Link
                to="/formacion/curso/despertar-maestria"
                className="block text-center py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Comenzar mi despertar
              </Link>
            </motion.div>

            {/* Chakras — Viaje hacia el Interior */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-8"
            >
              <BookOpen className="w-8 h-8 text-lavender-deep mb-4" />
              <h2 className="font-heading text-2xl font-medium mb-2">{viajeInterior.name}</h2>
              <p className="text-sm font-body italic text-muted-foreground mb-4">{viajeInterior.metadata.subtitle}</p>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">
                {viajeInterior.description}
              </p>

              <div className="space-y-3 mb-6">
                {viajePricing.map((p) => (
                  <div
                    key={p.label}
                    className={`flex justify-between items-center py-2 rounded-lg text-sm font-body ${p.highlight ? "bg-lavender/20 px-3" : "border-b border-border/30"}`}
                  >
                    <span className={p.highlight ? "font-medium" : ""}>{p.label}</span>
                    <span className={`font-heading text-lg ${p.highlight ? "text-lavender-deep" : "text-earth"}`}>
                      {p.amount}€{p.perUnit}
                      {p.note && <span className="text-xs text-muted-foreground"> {p.note}</span>}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/formacion/curso/viaje-interior"
                className="block text-center py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Iniciar mi viaje
              </Link>
            </motion.div>
          </div>

          {/* Membresía */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-8 md:p-10"
          >
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-lavender-deep flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-medium mb-2">{page.membership_title}</h2>
                <span className="inline-block px-3 py-1 bg-sand/50 text-earth text-xs font-body rounded-full mb-4">
                  {page.membership_badge}
                </span>
                <p className="text-sm text-muted-foreground font-body font-light mb-4">
                  {page.membership_text}
                </p>
                <div className="flex gap-6 mb-6">
                  {membresiaPresencial && (
                    <div>
                      <p className="text-xs text-muted-foreground font-body">Presencial</p>
                      <p className="font-heading text-xl text-earth">{membresiaPresencial.price}€/mes</p>
                    </div>
                  )}
                  {membresiaOnline && (
                    <div>
                      <p className="text-xs text-muted-foreground font-body">Online</p>
                      <p className="font-heading text-xl text-earth">{membresiaOnline.price}€/mes</p>
                    </div>
                  )}
                </div>
                <button className="px-8 py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity">
                  {page.membership_button_label}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Masterclass teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-2 border-dashed border-sand rounded-xl p-8 text-center"
          >
            <Mail className="w-8 h-8 text-lavender-deep mx-auto mb-4" />
            <h3 className="font-heading text-xl font-medium mb-2">{page.masterclass_title}</h3>
            <span className="inline-block px-3 py-1 bg-lavender/30 text-lavender-deep text-xs font-body rounded-full mb-4">
              {page.masterclass_badge}
            </span>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              {page.masterclass_text}
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
              <button className="px-6 py-2.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity">
                {page.masterclass_button_label}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cursos;
