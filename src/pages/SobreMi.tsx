import { motion } from "framer-motion";
import terapeutaImg from "@/assets/terapeuta.jpg";
import mikaoUsuiImg from "@/assets/mikao-usui.jpg";
import meditacionImg from "@/assets/meditacion-grupo.jpg";
import chakraMandalaImg from "@/assets/chakra-mandala.png";
import simboloReikiImg from "@/assets/simbolo-reiki.png";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SOBRE_MI_DEFAULT } from "@/lib/contentDefaults";

const SobreMi = () => {
  const { content: c } = useSiteContent("sobre_mi", SOBRE_MI_DEFAULT);

  return (
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
            {c.title}
          </h1>

          <div className="space-y-6 text-muted-foreground font-body font-light leading-relaxed">
            {c.intro_paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h2 className="font-heading text-2xl font-medium text-foreground pt-6">{c.philosophy_title}</h2>
            <p>{c.philosophy_text}</p>
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
                {c.origins_title}
              </h2>
              {c.origins_paragraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground font-body font-light leading-relaxed mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              <img
                src={c.mikao_image_url || mikaoUsuiImg}
                alt="Mikao Usui, fundador del Reiki"
                className="w-full max-w-xs rounded-xl shadow-lg object-cover"
              />
              <p className="text-xs text-muted-foreground font-body italic">{c.mikao_caption}</p>
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
                src={c.symbol_image_url || simboloReikiImg}
                alt="Símbolo Reiki Hon Sha Ze Sho Nen"
                className="w-32 h-auto mb-4 rounded-lg shadow-md"
              />
              <p className="text-xs text-muted-foreground font-body italic">{c.symbol_caption}</p>
            </div>
            <div className="md:col-span-2">
              <h2 className="font-heading text-3xl font-light italic text-lavender-deep mb-6">
                {c.energy_title}
              </h2>
              {c.energy_paragraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground font-body font-light leading-relaxed mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <img
              src={c.chakra_image_url || chakraMandalaImg}
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
            src={c.community_image_url || meditacionImg}
            alt="Grupo de meditación y práctica de Reiki"
            className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-lg mb-8"
          />
          <h2 className="font-heading text-3xl font-light italic text-lavender-deep mb-6">
            {c.community_title}
          </h2>
          <p className="text-muted-foreground font-body font-light leading-relaxed">
            {c.community_text}
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
            {c.elisabet_title}
          </h2>

          <img
            src={c.elisabet_image_url || terapeutaImg}
            alt="Elisabet, terapeuta y Maestra de Reiki"
            className="w-full h-auto rounded-xl object-cover mb-10 shadow-lg"
          />

          <div className="space-y-6 text-muted-foreground font-body font-light leading-relaxed">
            {c.elisabet_paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="text-foreground font-normal italic">
              {c.elisabet_closing}
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SobreMi;
