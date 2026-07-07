// Fallback content shown while site_content loads (or if a row is missing).
// Kept in sync with the seed data in supabase/migrations/20260707120100_seed_editable_content.sql.

export interface HomeContent {
  hero_title: string;
  hero_subtitle: string;
  cta_primary_label: string;
  cta_secondary_label: string;
  reiki_title: string;
  reiki_text: string;
  reiki_image_url: string | null;
  benefits_title: string;
  benefits: { icon: string; title: string; desc: string }[];
  steps_title: string;
  steps: { label: string; desc: string }[];
  cta_title: string;
  cta_text: string;
  cta_button_label: string;
}

export const HOME_DEFAULT: HomeContent = {
  hero_title: "Reconecta con tu equilibrio interior",
  hero_subtitle: "Terapias energéticas y formación holística para tu bienestar integral",
  cta_primary_label: "Reservar sesión",
  cta_secondary_label: "Conoce el Reiki",
  reiki_title: "¿Qué es el Reiki?",
  reiki_text:
    "El Reiki es una técnica de canalización de energía universal que promueve la relajación profunda y activa los procesos naturales de sanación del cuerpo. No es una creencia ni una religión — es una herramienta práctica para mejorar tu bienestar físico, emocional y mental. A través de la imposición de manos, se trabaja con el campo energético para restaurar el equilibrio y la armonía.",
  reiki_image_url: null,
  benefits_title: "Beneficios del Reiki",
  benefits: [
    { icon: "Heart", title: "Equilibrio emocional", desc: "Armoniza tus emociones y encuentra estabilidad interior" },
    { icon: "Brain", title: "Claridad mental", desc: "Despeja la mente y mejora tu capacidad de enfoque" },
    { icon: "Leaf", title: "Alivio del estrés", desc: "Reduce la tensión acumulada y recupera la calma" },
    { icon: "Compass", title: "Conexión interior", desc: "Reconecta con tu esencia y tu sabiduría interna" },
    { icon: "Sun", title: "Armonía energética", desc: "Restaura el flujo natural de energía en tu cuerpo" },
    { icon: "Sparkles", title: "Apoyo holístico", desc: "Acompaña tu bienestar físico, emocional y espiritual" },
  ],
  steps_title: "Tu camino de transformación",
  steps: [
    { label: "Sesión individual", desc: "Tu primera experiencia" },
    { label: "Pack 4 sesiones", desc: "Trabajo profundo" },
    { label: "Membresía", desc: "Acompañamiento continuo" },
  ],
  cta_title: "¿Lista para comenzar?",
  cta_text: "Reserva tu primera sesión y comienza tu camino hacia el bienestar",
  cta_button_label: "Contactar por WhatsApp",
};

export interface SobreMiContent {
  title: string;
  intro_paragraphs: string[];
  philosophy_title: string;
  philosophy_text: string;
  origins_title: string;
  origins_paragraphs: string[];
  mikao_image_url: string | null;
  mikao_caption: string;
  symbol_image_url: string | null;
  symbol_caption: string;
  energy_title: string;
  energy_paragraphs: string[];
  chakra_image_url: string | null;
  community_title: string;
  community_text: string;
  community_image_url: string | null;
  elisabet_title: string;
  elisabet_image_url: string | null;
  elisabet_paragraphs: string[];
  elisabet_closing: string;
}

export const SOBRE_MI_DEFAULT: SobreMiContent = {
  title: "Sobre nosotros",
  intro_paragraphs: [
    "En ReikiHolistik acompañamos procesos de bienestar y crecimiento personal a través de la energía del Reiki.",
    "Nuestra empresa nace en el año 2020, con el propósito de acercar terapias energéticas a más personas de una manera accesible, profunda y transformadora. Sin embargo, detrás de este proyecto hay una trayectoria mucho más amplia: 24 años de experiencia como terapeuta y Maestra de Reiki, dedicados al cuidado integral del cuerpo, la mente y el espíritu.",
    "A lo largo de estos años, hemos acompañado a numerosas personas en su camino hacia el equilibrio emocional, la sanación energética y el desarrollo personal.",
  ],
  philosophy_title: "Nuestra filosofía",
  philosophy_text:
    "Creemos en el poder de la energía Reiki para transformar vidas. Trabajamos desde el respeto, la escucha y la conexión, ofreciendo un espacio seguro donde cada persona puede reconectar consigo misma y avanzar en su proceso personal.",
  origins_title: "Los orígenes del Reiki",
  origins_paragraphs: [
    "El Reiki fue desarrollado por Mikao Usui en Japón a principios del siglo XX. Tras una profunda experiencia espiritual en el Monte Kurama, Usui sistematizó una técnica de canalización de energía universal que hoy se practica en todo el mundo.",
    "La palabra Reiki proviene de dos kanji japoneses: Rei (energía universal) y Ki (energía vital), representando la unión entre la energía cósmica y la fuerza vital que habita en cada ser.",
  ],
  mikao_image_url: null,
  mikao_caption: "Mikao Usui (1865–1926)",
  symbol_image_url: null,
  symbol_caption: "Hon Sha Ze Sho Nen",
  energy_title: "Energía, chakras y símbolos",
  energy_paragraphs: [
    "El Reiki trabaja con los centros energéticos del cuerpo — los chakras — armonizando el flujo de energía vital. Los símbolos sagrados del Reiki actúan como llaves que amplifican y dirigen esta energía hacia donde más se necesita.",
    "En nuestras formaciones profundizamos en cada chakra, su función, sus bloqueos y cómo restaurar su equilibrio a través de la práctica consciente.",
  ],
  chakra_image_url: null,
  community_title: "La práctica en comunidad",
  community_text:
    "Además de las sesiones individuales, en Reiki Holistik fomentamos la práctica grupal como espacio de crecimiento compartido. Los encuentros de meditación y las formaciones presenciales crean vínculos profundos entre los participantes, enriqueciendo el proceso de cada uno.",
  community_image_url: null,
  elisabet_title: "Sobre mí — Elisabet",
  elisabet_image_url: null,
  elisabet_paragraphs: [
    "Mi nombre es Elisabet, y mi camino en el mundo energético y espiritual comenzó mucho antes de ser consciente de ello.",
    "En el año 1997 viví un momento clave en mi vida: el despertar de mis capacidades naturales como canalizadora y médium. Fue una etapa profunda de transformación personal, en la que empecé a comprender y aceptar mi sensibilidad hacia lo sutil, desarrollando una conexión más consciente con la energía y los planos espirituales.",
    "Años más tarde, en 2002, di un paso importante en mi formación al iniciarme como terapeuta de Reiki. Descubrí en esta disciplina una herramienta poderosa de sanación energética que resonaba profundamente con mi esencia y con mis dones naturales. Desde ese momento, el Reiki se convirtió en una parte fundamental de mi vida y de mi propósito, acompañando a otras personas en sus procesos de equilibrio, bienestar y evolución.",
    "Con el tiempo, mi compromiso y dedicación me llevaron a profundizar aún más en este camino, y en 2011 me formé como Maestra de Reiki Usui Tradicional y Tibetano. Este nuevo nivel no solo consolidó mis conocimientos, sino que también me permitió transmitir esta práctica a otras personas, guiándolas en su propio despertar y desarrollo energético.",
    "Hoy, mi labor integra toda esta experiencia: mi sensibilidad como canalizadora y médium, junto con mi recorrido como terapeuta y maestra de Reiki. Acompaño a quienes llegan a mí desde un enfoque cercano, respetuoso y profundamente humano, honrando cada proceso individual.",
  ],
  elisabet_closing:
    "Mi propósito es ofrecer un espacio de luz, conciencia y sanación, donde cada persona pueda reconectar consigo misma y con su propio potencial.",
};

export interface InstructorContent {
  name: string;
  title: string;
  bio_short: string[];
  image_url: string | null;
}

export const INSTRUCTOR_DEFAULT: InstructorContent = {
  name: "Elisabet",
  title: "Maestra de Reiki Usui · Canalizadora y Médium",
  bio_short: [
    "Con más de 24 años de experiencia como terapeuta y Maestra de Reiki, Elisabet comenzó su camino espiritual en 1997 con el despertar de sus capacidades como canalizadora y médium. Se inició como terapeuta de Reiki en 2002 y se formó como Maestra de Reiki Usui Tradicional y Tibetano en 2011.",
    "Su labor integra su sensibilidad como canalizadora junto con su recorrido como terapeuta y maestra, acompañando desde un enfoque cercano, respetuoso y profundamente humano.",
  ],
  image_url: null,
};

export interface ContactoContent {
  title: string;
  subtitle: string;
  submit_label: string;
}

export const CONTACTO_DEFAULT: ContactoContent = {
  title: "Contacto",
  subtitle: "Escríbeme y te responderé lo antes posible",
  submit_label: "Enviar mensaje",
};

export interface SettingsContent {
  whatsapp_number: string;
  whatsapp_cta_label: string;
  iban: string;
}

export const SETTINGS_DEFAULT: SettingsContent = {
  whatsapp_number: "34600000000",
  whatsapp_cta_label: "Contactar por WhatsApp",
  iban: "BE39905290167019",
};

export interface SesionOption {
  slug: string;
  label: string;
  pricingLabel?: string;
}

export interface SesionCard {
  serviceType: "individual" | "pack" | "membership";
  title: string;
  icon: string;
  desc: string;
  badge?: string | null;
  badgeLocked?: string;
  badgeUnlocked?: string;
  buttonLabel: string;
  options: SesionOption[];
}

export interface SesionesContent {
  title: string;
  subtitle: string;
  cards: SesionCard[];
}

export const SESIONES_DEFAULT: SesionesContent = {
  title: "Sesiones de Reiki",
  subtitle: "Cada sesión es un espacio seguro y personalizado para tu bienestar",
  cards: [
    {
      serviceType: "individual",
      title: "Sesión individual",
      icon: "Sparkles",
      desc: "Una sesión completa de Reiki personalizada, adaptada a tus necesidades del momento. Ideal para una primera experiencia o para sesiones puntuales.",
      badge: null,
      buttonLabel: "Reservar",
      options: [
        { slug: "sesion-presencial", label: "Presencial" },
        { slug: "sesion-online", label: "Online" },
      ],
    },
    {
      serviceType: "pack",
      title: "Pack 4 sesiones",
      icon: "Star",
      desc: "Trabajo profundo sobre los 4 cuerpos: físico, emocional, mental y espiritual. Un proceso de transformación integral en 4 encuentros.",
      badge: "Desbloquea la Membresía",
      buttonLabel: "Reservar",
      options: [
        { slug: "pack-4-sesiones", label: "Pack Online (4 sesiones)", pricingLabel: "Online" },
        { slug: "pack-4-sesiones", label: "Pack Presencial (4 sesiones)", pricingLabel: "Presencial" },
      ],
    },
    {
      serviceType: "membership",
      title: "Membresía",
      icon: "Lock",
      desc: "2 sesiones al mes (cada ~15 días) para mantener tu equilibrio energético de forma continua. Un acompañamiento regular para tu bienestar.",
      badgeLocked: "Requiere Pack de 4 o Formación",
      badgeUnlocked: "Acceso desbloqueado",
      buttonLabel: "Unirme",
      options: [
        { slug: "membresia-online", label: "Membresía Online" },
        { slug: "membresia-presencial", label: "Membresía Presencial" },
      ],
    },
  ],
};

export interface FormacionHomeContent {
  title: string;
  subtitle: string;
}

export const FORMACION_HOME_DEFAULT: FormacionHomeContent = {
  title: "Tu transformación comienza aquí",
  subtitle: "Formación certificada en Reiki y Chakras. Aprende a canalizar energía y acompaña a otros en su camino de bienestar.",
};

export interface CursosPageContent {
  title: string;
  subtitle: string;
  membership_title: string;
  membership_badge: string;
  membership_text: string;
  membership_button_label: string;
  masterclass_title: string;
  masterclass_badge: string;
  masterclass_text: string;
  masterclass_button_label: string;
}

export const CURSOS_PAGE_DEFAULT: CursosPageContent = {
  title: "Cursos y Formación",
  subtitle: "Elige tu camino de transformación y crecimiento personal",
  membership_title: "Membresía",
  membership_badge: "Solo accesible tras completar el Pack de 4 consultas o cualquier curso",
  membership_text: "2 sesiones al mes (~cada 15 días). Acompañamiento energético continuo.",
  membership_button_label: "Unirme a la membresía",
  masterclass_title: "Masterclass",
  masterclass_badge: "Próximamente",
  masterclass_text: "Déjanos tu email y te avisaremos cuando esté disponible",
  masterclass_button_label: "Avisar",
};
