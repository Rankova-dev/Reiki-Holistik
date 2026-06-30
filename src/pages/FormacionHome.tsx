import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, BookOpen, Star } from "lucide-react";

const FormacionHome = () => (
  <div>
    <section className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-4xl md:text-6xl font-light italic text-lavender-deep leading-tight mb-6"
        >
          Tu transformación comienza aquí
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-muted-foreground font-body font-light mb-10 max-w-xl mx-auto"
        >
          Formación certificada en Reiki y Chakras. Aprende a canalizar energía y acompaña a otros en su camino de bienestar.
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
          <span className="relative inline-flex items-center gap-1.5 px-4 py-1.5 bg-golden/20 text-golden border border-golden/30 text-xs font-body font-medium rounded-full mb-6">
            <Crown className="w-3.5 h-3.5" /> Más completo · Precio especial
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-medium mb-2 relative">Curso Completo</h2>
          <p className="font-heading text-lg italic text-cream/80 mb-4 relative">
            Despertar de tu Maestría + Viaje hacia el Interior
          </p>
          <p className="font-body font-light text-cream/70 text-sm mb-8 max-w-2xl relative">
            El viaje transformacional completo. 10 encuentros (uno mensual, de octubre a julio) que incluyen la certificación de Reiki en 3 niveles y la formación de los 7 chakras. Aprenderás a meditar, conocerás los chakras en profundidad, aprenderás a equilibrarlos y sanarlos. Incluye seguimiento por WhatsApp entre encuentros.
          </p>
          <div className="relative grid grid-cols-2 gap-4 max-w-md mb-8">
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-5 border border-cream/20 text-center">
              <p className="text-xs text-cream/60 font-body mb-1">Mensual</p>
              <p className="font-heading text-3xl">80€</p>
              <p className="text-xs text-cream/50 font-body">/mes</p>
            </div>
            <div className="bg-golden/15 backdrop-blur-sm rounded-xl p-5 border border-golden/30 text-center relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-golden text-earth-deep text-[10px] font-body font-bold rounded-full uppercase tracking-wide">
                Mejor precio
              </span>
              <p className="text-xs text-cream/60 font-body mb-1">Pago único</p>
              <p className="font-heading text-3xl">700€</p>
              <p className="text-xs text-golden font-body font-medium">Ahorras 100€</p>
            </div>
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
            <h2 className="font-heading text-2xl font-medium mb-2">Despertar de tu Maestría</h2>
            <p className="text-sm font-body italic text-muted-foreground mb-4">Curso de Reiki · 3 niveles</p>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              Certificación completa de Reiki Usui en 3 niveles. 2 encuentros por nivel con pausas de 3 meses para integración.
            </p>

            <div className="space-y-2 mb-6 text-sm font-body">
              <div className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg">
                <span>Nivel I · 2 encuentros</span>
                <span className="font-heading text-lg text-earth-deep font-medium">150€</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg">
                <span>Nivel II · 2 encuentros</span>
                <span className="font-heading text-lg text-earth-deep font-medium">200€</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg">
                <span>Nivel III · 2 encuentros</span>
                <span className="font-heading text-lg text-earth-deep font-medium">175€</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-lavender/30 to-lavender/10 rounded-xl p-4 mb-6 border border-lavender/30 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-lavender-deep" />
                <span className="text-xs font-body font-medium text-lavender-deep uppercase tracking-wide">Pack completo</span>
              </div>
              <p className="font-heading text-3xl text-lavender-deep">500€</p>
              <p className="text-xs text-muted-foreground font-body">Ahorras 25€ · 3 niveles incluidos</p>
            </div>

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
            <h2 className="font-heading text-2xl font-medium mb-2">Viaje hacia el Interior</h2>
            <p className="text-sm font-body italic text-muted-foreground mb-4">Curso de Chakras · 9 encuentros</p>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              9 encuentros mensuales explorando en profundidad el sistema de chakras. Sesiones grupales
              preferentemente, individuales si el grupo no se forma.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center py-2.5 px-3 bg-muted/50 rounded-lg text-sm font-body">
                <span>Mensual (9 meses)</span>
                <span className="font-heading text-lg text-earth-deep font-medium">60€/mes</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-lavender/30 to-lavender/10 rounded-xl p-4 mb-6 border border-lavender/30 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-lavender-deep" />
                <span className="text-xs font-body font-medium text-lavender-deep uppercase tracking-wide">Pago único</span>
              </div>
              <p className="font-heading text-3xl text-lavender-deep">490€</p>
              <p className="text-xs text-muted-foreground font-body">Ahorras 50€ · 9 encuentros incluidos</p>
            </div>

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

export default FormacionHome;
