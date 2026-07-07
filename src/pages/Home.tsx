import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";
import energiaManosImg from "@/assets/energia-manos.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { HOME_DEFAULT, SETTINGS_DEFAULT } from "@/lib/contentDefaults";
import { getIcon } from "@/lib/iconMap";

const Home = () => {
  const { content } = useSiteContent("home", HOME_DEFAULT);
  const { content: settings } = useSiteContent("settings", SETTINGS_DEFAULT);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[90vh] flex items-center justify-center px-6">
        <div className="text-center max-w-3xl mx-auto">
          <motion.img
            src={logoImg}
            alt="Reiki Holistik"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 rounded-full object-cover drop-shadow-lg"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-light italic text-lavender-deep leading-tight mb-6"
          >
            {content.hero_title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground font-body font-light mb-10 max-w-xl mx-auto"
          >
            {content.hero_subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/sesiones"
              className="px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {content.cta_primary_label}
            </Link>
            <Link
              to="/sobre-mi"
              className="px-8 py-3.5 border border-earth-deep text-earth-deep rounded-full font-body font-medium text-sm hover:bg-earth-deep hover:text-cream transition-all"
            >
              {content.cta_secondary_label}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What is Reiki — with image */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-light mb-6 text-foreground">{content.reiki_title}</h2>
              <p className="text-muted-foreground font-body font-light leading-relaxed text-lg">
                {content.reiki_text}
              </p>
            </div>
            <motion.img
              src={content.reiki_image_url || energiaManosImg}
              alt="Energía Reiki a través de las manos"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full h-72 md:h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl font-light text-center mb-16">{content.benefits_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map((b, i) => {
              const Icon = getIcon(b.icon);
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6"
                >
                  <Icon className="w-8 h-8 text-lavender-deep mb-4" />
                  <h3 className="font-heading text-xl font-medium mb-2">{b.title}</h3>
                  <p className="text-muted-foreground font-body font-light text-sm">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Path */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-3xl md:text-4xl font-light text-center mb-16">{content.steps_title}</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {content.steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-lavender/30 flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading text-xl font-semibold text-lavender-deep">{i + 1}</span>
                  </div>
                  <h3 className="font-heading text-lg font-medium">{step.label}</h3>
                  <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
                </div>
                {i < content.steps.length - 1 && (
                  <div className="hidden md:block w-16 h-px bg-sand" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-light mb-6">{content.cta_title}</h2>
          <p className="text-muted-foreground font-body font-light mb-8">
            {content.cta_text}
          </p>
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {content.cta_button_label}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
