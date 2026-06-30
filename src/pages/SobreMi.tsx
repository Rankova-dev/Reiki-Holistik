import { motion } from "framer-motion";
import terapeutaImg from "@/assets/terapeuta.jpg";
import mikaoUsuiImg from "@/assets/mikao-usui.jpg";
import meditacionImg from "@/assets/meditacion-grupo.jpg";
import chakraMandalaImg from "@/assets/chakra-mandala.png";
import simboloReikiImg from "@/assets/simbolo-reiki.png";

const SobreMi = () => (
  <div className="py-24 px-6">
    <div className="container mx-auto max-w-4xl">
      {/* ── Sobre Reiki Holistik ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-8">
          Sobre nosotros
        </h1>

        <div className="space-y-6 text-muted-foreground font-body font-light leading-relaxed">
          <p>
            En ReikiHolistik acompañamos procesos de bienestar y crecimiento personal a través de la energía del Reiki.
          </p>
          <p>
            Nuestra empresa nace en el año 2020, con el propósito de acercar terapias energéticas a más personas de una manera accesible, profunda y transformadora. Sin embargo, detrás de este proyecto hay una trayectoria mucho más amplia: 24 años de experiencia como terapeuta y Maestra de Reiki, dedicados al cuidado integral del cuerpo, la mente y el espíritu.
          </p>
          <p>
            A lo largo de estos años, hemos acompañado a numerosas personas en su camino hacia el equilibrio emocional, la sanación energética y el desarrollo personal.
          </p>

          <h2 className="font-heading text-2xl font-medium text-foreground pt-6">Nuestra filosofía</h2>
          <p>
            Creemos en el poder de la energía Reiki para transformar vidas. Trabajamos desde el respeto, la escucha y la conexión, ofreciendo un espacio seguro donde cada persona puede reconectar consigo misma y avanzar en su proceso personal.
          </p>
        </div>
      </motion.section>

      {/* ── Qué es el Reiki - historia ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-heading text-3xl font-light italic text-lavender-deep mb-6">
              Los orígenes del Reiki
            </h2>
            <p className="text-muted-foreground font-body font-light leading-relaxed mb-4">
              El Reiki fue desarrollado por Mikao Usui en Japón a principios del siglo XX. Tras una profunda experiencia espiritual en el Monte Kurama, Usui sistematizó una técnica de canalización de energía universal que hoy se practica en todo el mundo.
            </p>
            <p className="text-muted-foreground font-body font-light leading-relaxed">
              La palabra Reiki proviene de dos kanji japoneses: <em>Rei</em> (energía universal) y <em>Ki</em> (energía vital), representando la unión entre la energía cósmica y la fuerza vital que habita en cada ser.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <img
              src={mikaoUsuiImg}
              alt="Mikao Usui, fundador del Reiki"
              className="w-full max-w-xs rounded-xl shadow-lg object-cover"
            />
            <p className="text-xs text-muted-foreground font-body italic">Mikao Usui (1865–1926)</p>
          </div>
        </div>
      </motion.section>

      {/* ── Simbolo y chakras ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center text-center">
            <img
              src={simboloReikiImg}
              alt="Símbolo Reiki Hon Sha Ze Sho Nen"
              className="w-32 h-auto mb-4 rounded-lg shadow-md"
            />
            <p className="text-xs text-muted-foreground font-body italic">Hon Sha Ze Sho Nen</p>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-heading text-3xl font-light italic text-lavender-deep mb-6">
              Energía, chakras y símbolos
            </h2>
            <p className="text-muted-foreground font-body font-light leading-relaxed mb-4">
              El Reiki trabaja con los centros energéticos del cuerpo — los chakras — armonizando el flujo de energía vital. Los símbolos sagrados del Reiki actúan como llaves que amplifican y dirigen esta energía hacia donde más se necesita.
            </p>
            <p className="text-muted-foreground font-body font-light leading-relaxed">
              En nuestras formaciones profundizamos en cada chakra, su función, sus bloqueos y cómo restaurar su equilibrio a través de la práctica consciente.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <img
            src={chakraMandalaImg}
            alt="Mandala de chakras"
            className="w-48 h-48 rounded-full shadow-lg object-cover"
          />
        </div>
      </motion.section>

      {/* ── Meditación y práctica ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <img
          src={meditacionImg}
          alt="Grupo de meditación y práctica de Reiki"
          className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg mb-8"
        />
        <h2 className="font-heading text-3xl font-light italic text-lavender-deep mb-6">
          La práctica en comunidad
        </h2>
        <p className="text-muted-foreground font-body font-light leading-relaxed">
          Además de las sesiones individuales, en Reiki Holistik fomentamos la práctica grupal como espacio de crecimiento compartido. Los encuentros de meditación y las formaciones presenciales crean vínculos profundos entre los participantes, enriqueciendo el proceso de cada uno.
        </p>
      </motion.section>

      {/* ── Sobre Elisabet ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-3xl md:text-4xl font-light italic text-lavender-deep mb-8">
          Sobre mí — Elisabet
        </h2>

        <img
          src={terapeutaImg}
          alt="Elisabet, terapeuta y Maestra de Reiki"
          className="w-full h-auto rounded-xl object-cover mb-10 shadow-lg"
        />

        <div className="space-y-6 text-muted-foreground font-body font-light leading-relaxed">
          <p>
            Mi nombre es Elisabet, y mi camino en el mundo energético y espiritual comenzó mucho antes de ser consciente de ello.
          </p>
          <p>
            En el año 1997 viví un momento clave en mi vida: el despertar de mis capacidades naturales como canalizadora y médium. Fue una etapa profunda de transformación personal, en la que empecé a comprender y aceptar mi sensibilidad hacia lo sutil, desarrollando una conexión más consciente con la energía y los planos espirituales.
          </p>
          <p>
            Años más tarde, en 2002, di un paso importante en mi formación al iniciarme como terapeuta de Reiki. Descubrí en esta disciplina una herramienta poderosa de sanación energética que resonaba profundamente con mi esencia y con mis dones naturales. Desde ese momento, el Reiki se convirtió en una parte fundamental de mi vida y de mi propósito, acompañando a otras personas en sus procesos de equilibrio, bienestar y evolución.
          </p>
          <p>
            Con el tiempo, mi compromiso y dedicación me llevaron a profundizar aún más en este camino, y en 2011 me formé como Maestra de Reiki Usui Tradicional y Tibetano. Este nuevo nivel no solo consolidó mis conocimientos, sino que también me permitió transmitir esta práctica a otras personas, guiándolas en su propio despertar y desarrollo energético.
          </p>
          <p>
            Hoy, mi labor integra toda esta experiencia: mi sensibilidad como canalizadora y médium, junto con mi recorrido como terapeuta y maestra de Reiki. Acompaño a quienes llegan a mí desde un enfoque cercano, respetuoso y profundamente humano, honrando cada proceso individual.
          </p>
          <p className="text-foreground font-normal italic">
            Mi propósito es ofrecer un espacio de luz, conciencia y sanación, donde cada persona pueda reconectar consigo misma y con su propio potencial.
          </p>
        </div>
      </motion.section>
    </div>
  </div>
);

export default SobreMi;
