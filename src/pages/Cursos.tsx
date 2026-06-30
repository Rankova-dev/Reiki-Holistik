import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Sparkles, BookOpen, Lock, Mail } from "lucide-react";

const Cursos = () => (
  <div className="py-24 px-6">
    <div className="container mx-auto max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-4 text-center">
          Cursos y Formación
        </h1>
        <p className="text-center text-muted-foreground font-body font-light mb-16 max-w-2xl mx-auto">
          Elige tu camino de transformación y crecimiento personal
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
          <span className="absolute -top-3 left-6 px-4 py-1 bg-lavender text-earth-deep text-xs font-body font-medium rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> Más completo · Precio especial
          </span>
          <h2 className="font-heading text-3xl font-medium mb-2">Curso Completo</h2>
          <p className="font-heading text-lg italic text-cream/80 mb-4">
            Viaje hacia el Interior + Despertar de tu Maestría
          </p>
          <p className="font-body font-light text-cream/70 text-sm mb-6 max-w-2xl">
            El viaje transformacional completo: de octubre a junio, ~10 encuentros mensuales. Incluye la
            certificación de Reiki (3 niveles) y el curso de Chakras (9 encuentros). Sesiones individuales
            y grupales, principalmente online vía Jitsi Meet.
          </p>
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-sm text-cream/60 font-body">Mensual</p>
              <p className="font-heading text-2xl">80€/mes</p>
            </div>
            <div>
              <p className="text-sm text-cream/60 font-body">Anual</p>
              <p className="font-heading text-2xl">700€ <span className="text-sm text-cream/60 font-body">ahorra 60€</span></p>
            </div>
          </div>
          <Link
            to="/formacion/curso/curso-completo"
            className="inline-block px-8 py-3 bg-cream text-earth-deep rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Comenzar el proceso
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reiki */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-8"
          >
            <Sparkles className="w-8 h-8 text-lavender-deep mb-4" />
            <h2 className="font-heading text-2xl font-medium mb-2">Viaje hacia el Interior</h2>
            <p className="text-sm font-body italic text-muted-foreground mb-4">Curso de Reiki · 3 niveles</p>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              Certificación completa de Reiki Usui en 3 niveles. Puedes comprar el pack completo o nivel por nivel.
            </p>

            <div className="space-y-3 mb-6 text-sm font-body">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span>Nivel I · 2 encuentros</span>
                <span className="font-heading text-lg text-earth">150€</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span>Nivel II · 1 encuentro</span>
                <span className="font-heading text-lg text-earth">200€</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span>Nivel III · 1 encuentro</span>
                <span className="font-heading text-lg text-earth">175€</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-lavender/20 rounded-lg px-3">
                <span className="font-medium">Pack completo (3 niveles)</span>
                <span className="font-heading text-lg text-lavender-deep">500€</span>
              </div>
            </div>

            <Link
              to="/formacion/curso/viaje-interior"
              className="block text-center py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Comenzar mi viaje
            </Link>
          </motion.div>

          {/* Chakras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-8"
          >
            <BookOpen className="w-8 h-8 text-lavender-deep mb-4" />
            <h2 className="font-heading text-2xl font-medium mb-2">Despertar de tu Maestría</h2>
            <p className="text-sm font-body italic text-muted-foreground mb-4">Curso de Chakras · 9 encuentros</p>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              9 encuentros mensuales explorando en profundidad el sistema de chakras. Sesiones grupales
              preferentemente, individuales si el grupo no se forma.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-border/30 text-sm font-body">
                <span>Mensual (9 meses)</span>
                <span className="font-heading text-lg text-earth">60€/mes</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-lavender/20 rounded-lg px-3 text-sm font-body">
                <span className="font-medium">Pago único</span>
                <span className="font-heading text-lg text-lavender-deep">490€ <span className="text-xs text-muted-foreground">ahorra 50€</span></span>
              </div>
            </div>

            <Link
              to="/formacion/curso/despertar-maestria"
              className="block text-center py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Iniciar mi despertar
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
              <h2 className="font-heading text-2xl font-medium mb-2">Membresía</h2>
              <span className="inline-block px-3 py-1 bg-sand/50 text-earth text-xs font-body rounded-full mb-4">
                Solo accesible tras completar el Pack de 4 consultas o cualquier curso
              </span>
              <p className="text-sm text-muted-foreground font-body font-light mb-4">
                2 sesiones al mes (~cada 15 días). Acompañamiento energético continuo.
              </p>
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground font-body">Presencial</p>
                  <p className="font-heading text-xl text-earth">65€/mes</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Online</p>
                  <p className="font-heading text-xl text-earth">55€/mes</p>
                </div>
              </div>
              <button className="px-8 py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity">
                Unirme a la membresía
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
          <h3 className="font-heading text-xl font-medium mb-2">Masterclass</h3>
          <span className="inline-block px-3 py-1 bg-lavender/30 text-lavender-deep text-xs font-body rounded-full mb-4">
            Próximamente
          </span>
          <p className="text-sm text-muted-foreground font-body font-light mb-6">
            Déjanos tu email y te avisaremos cuando esté disponible
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
            />
            <button className="px-6 py-2.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity">
              Avisar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

export default Cursos;
