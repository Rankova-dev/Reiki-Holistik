import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, BookOpen, Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useProductsBySlug } from "@/hooks/useProducts";
import { FORMACION_HOME_DEFAULT } from "@/lib/contentDefaults";

const FormacionHome = () => {
  const { content: page } = useSiteContent("formacion_home", FORMACION_HOME_DEFAULT);
  const { bySlug } = useProductsBySlug(["curso-completo", "despertar-maestria", "viaje-interior"]);

  const cursoCompleto = bySlug["curso-completo"];
  const despertarMaestria = bySlug["despertar-maestria"];
  const viajeInterior = bySlug["viaje-interior"];

  if (!cursoCompleto || !despertarMaestria || !viajeInterior) {
    return <div className="py-24 text-center text-muted-foreground">Cargando...</div>;
  }

  const cursoCompletoPricing = cursoCompleto.metadata.pricing_options || [];
  const despertarPricing = despertarMaestria.metadata.pricing_options || [];
  const viajePricing = viajeInterior.metadata.pricing_options || [];
  const despertarPack = despertarPricing.find((p) => p.highlight);
  const viajePagoUnico = viajePricing.find((p) => p.highlight);
  const viajeMensual = viajePricing.find((p) => !p.highlight);

  return (
    <div>
      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-4xl md:text-6xl font-light italic text-lavender-deep leading-tight mb-6"
          >
            {page.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-muted-foreground font-body font-light mb-10 max-w-xl mx-auto"
          >
            {page.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-5xl space-y-8">
          {/* Curso Completo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-earth-deep text-cream rounded-2xl p-8 md:p-10 border border-earth overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-golden/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            {cursoCompleto.metadata.badge && (
              <span className="relative inline-flex items-center gap-1.5 px-4 py-1.5 bg-golden/20 text-golden border border-golden/30 text-xs font-body font-medium rounded-full mb-6">
                <Crown className="w-3.5 h-3.5" /> {cursoCompleto.metadata.badge}
              </span>
            )}
            <h2 className="font-heading text-3xl md:text-4xl font-medium mb-2 relative">{cursoCompleto.name}</h2>
            <p className="font-heading text-lg italic text-cream/80 mb-4 relative">{cursoCompleto.metadata.subtitle}</p>
            <p className="font-body font-light text-cream/70 text-sm mb-8 max-w-2xl relative">
              {cursoCompleto.description}
            </p>
            <div className="relative grid grid-cols-2 gap-4 max-w-md mb-8">
              {cursoCompletoPricing.map((p) => (
                <div
                  key={p.label}
                  className={`backdrop-blur-sm rounded-xl p-5 border text-center relative ${
                    p.highlight ? "bg-golden/15 border-golden/30" : "bg-cream/10 border-cream/20"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-golden text-earth-deep text-[10px] font-body font-bold rounded-full uppercase tracking-wide">
                      Mejor precio
                    </span>
                  )}
                  <p className="text-xs text-cream/60 font-body mb-1">{p.label}</p>
                  <p className="font-heading text-3xl">{p.amount}€</p>
                  {p.perUnit && <p className="text-xs text-cream/50 font-body">{p.perUnit}</p>}
                  {p.note && <p className="text-xs text-golden font-body font-medium">{p.note}</p>}
                </div>
              ))}
            </div>
            <Link
              to="/formacion/curso/curso-completo"
              className="relative inline-block px-8 py-3.5 bg-cream text-earth-deep rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
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
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 flex flex-col"
            >
              <Sparkles className="w-8 h-8 text-lavender-deep mb-4" />
              <h2 className="font-heading text-2xl font-medium mb-2">{despertarMaestria.name}</h2>
              <p className="text-sm font-body italic text-muted-foreground mb-4">{despertarMaestria.metadata.subtitle}</p>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">
                {despertarMaestria.description}
              </p>

              <div className="space-y-2 mb-6 text-sm font-body">
                {despertarPricing.filter((p) => !p.highlight).map((p) => (
                  <div key={p.label} className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg">
                    <span>{p.label}</span>
                    <span className="font-heading text-lg text-earth-deep font-medium">{p.amount}€</span>
                  </div>
                ))}
              </div>

              {despertarPack && (
                <div className="bg-gradient-to-r from-lavender/30 to-lavender/10 rounded-xl p-4 mb-6 border border-lavender/30 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 text-lavender-deep" />
                    <span className="text-xs font-body font-medium text-lavender-deep uppercase tracking-wide">{despertarPack.label}</span>
                  </div>
                  <p className="font-heading text-3xl text-lavender-deep">{despertarPack.amount}€</p>
                  <p className="text-xs text-muted-foreground font-body">{despertarPack.note}</p>
                </div>
              )}

              <Link
                to="/formacion/curso/despertar-maestria"
                className="block text-center py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity mt-auto"
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
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 flex flex-col"
            >
              <BookOpen className="w-8 h-8 text-lavender-deep mb-4" />
              <h2 className="font-heading text-2xl font-medium mb-2">{viajeInterior.name}</h2>
              <p className="text-sm font-body italic text-muted-foreground mb-4">{viajeInterior.metadata.subtitle}</p>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">
                {viajeInterior.description}
              </p>

              {viajeMensual && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg text-sm font-body">
                    <span>{viajeMensual.label}</span>
                    <span className="font-heading text-lg text-earth-deep font-medium">{viajeMensual.amount}€{viajeMensual.perUnit}</span>
                  </div>
                </div>
              )}

              {viajePagoUnico && (
                <div className="bg-gradient-to-r from-lavender/30 to-lavender/10 rounded-xl p-4 mb-6 border border-lavender/30 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 text-lavender-deep" />
                    <span className="text-xs font-body font-medium text-lavender-deep uppercase tracking-wide">{viajePagoUnico.label}</span>
                  </div>
                  <p className="font-heading text-3xl text-lavender-deep">{viajePagoUnico.amount}€</p>
                  <p className="text-xs text-muted-foreground font-body">{viajePagoUnico.note}</p>
                </div>
              )}

              <Link
                to="/formacion/curso/viaje-interior"
                className="block text-center py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity mt-auto"
              >
                Iniciar mi viaje
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormacionHome;
