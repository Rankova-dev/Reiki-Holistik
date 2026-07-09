import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { store } from "./db";
import { env } from "./env";

function nowIso() {
  return new Date().toISOString();
}

// Admin user: re-synced from env on every boot, so changing .env + restarting rotates the password.
export function seedAdminUser() {
  const hash = bcrypt.hashSync(env.adminPassword, 10);
  store.setAdminUser(env.adminUsername, hash);
}

// Business-admin customer account (payment requests / credits / group sessions tabs), distinct
// from the content-admin user above. Re-synced from env on every boot, same pattern.
export function seedOwnerAdmin() {
  if (!env.ownerEmail || !env.ownerPassword) return;

  const hash = bcrypt.hashSync(env.ownerPassword, 10);
  const existing = store.getUserByEmail(env.ownerEmail);
  if (existing) {
    store.updateUser(existing.id, { password_hash: hash, role: "admin" });
  } else {
    store.createUser({
      id: crypto.randomUUID(),
      email: env.ownerEmail.toLowerCase(),
      password_hash: hash,
      google_sub: null,
      name: null,
      phone: null,
      role: "admin",
      created_at: nowIso(),
    });
  }
}

interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  type: string;
  metadata: Record<string, unknown>;
}

// Same UUIDs Supabase already uses for these products (payment_requests.product_id FKs to them there).
const PRODUCTS: SeedProduct[] = [
  {
    id: "57cbab1e-ebad-4330-9e15-737a51406f00",
    slug: "sesion-presencial",
    name: "Sesión Individual",
    description: "Una sesión completa de Reiki personalizada, adaptada a tus necesidades del momento. Ideal para una primera experiencia o para sesiones puntuales.",
    price: 60,
    type: "individual_session",
    metadata: {},
  },
  {
    id: "f693fad5-40e9-4147-bbce-1bb65cdca89e",
    slug: "sesion-online",
    name: "Sesión Individual",
    description: "Una sesión completa de Reiki personalizada, adaptada a tus necesidades del momento. Ideal para una primera experiencia o para sesiones puntuales.",
    price: 50,
    type: "individual_session",
    metadata: {},
  },
  {
    id: "b08e99fa-308f-4887-9b7f-cd3a71bcd51a",
    slug: "pack-4-sesiones",
    name: "Pack 4 Sesiones",
    description: "Trabajo profundo sobre los 4 cuerpos: físico, emocional, mental y espiritual. Un proceso de transformación integral en 4 encuentros.",
    price: 160,
    type: "session_pack",
    metadata: { pricing_options: [{ label: "Online", amount: 160 }, { label: "Presencial", amount: 180 }] },
  },
  {
    id: "24e7a193-d872-4e3c-95f4-b3881f523cd2",
    slug: "membresia-online",
    name: "Membresía",
    description: "2 sesiones al mes (cada ~15 días) para mantener tu equilibrio energético de forma continua. Un acompañamiento regular para tu bienestar.",
    price: 55,
    type: "membership",
    metadata: {},
  },
  {
    id: "2a5ee3b4-dff7-4235-8794-2c7aabb88aad",
    slug: "membresia-presencial",
    name: "Membresía",
    description: "2 sesiones al mes (cada ~15 días) para mantener tu equilibrio energético de forma continua. Un acompañamiento regular para tu bienestar.",
    price: 65,
    type: "membership",
    metadata: {},
  },
  {
    id: "1794172d-5113-431d-b48a-a836025c567b",
    slug: "curso-completo",
    name: "Curso Completo",
    description: "El viaje transformacional completo. 10 encuentros (uno mensual) que incluyen la certificación de Reiki en 3 niveles y la formación de los 7 chakras. Aprenderás a meditar, conocerás los chakras en profundidad, aprenderás a equilibrarlos y sanarlos. Incluye seguimiento por WhatsApp entre encuentros para un acompañamiento continuo.",
    price: 80,
    type: "course",
    metadata: {
      subtitle: "Despertar de tu Maestría + Viaje hacia el Interior",
      badge: "Más completo · Precio especial",
      image_url: null,
      includes: ["Certificación Reiki (3 niveles)", "Formación de los 7 chakras", "10 encuentros (uno mensual)", "Aprenderás a meditar", "Seguimiento por WhatsApp entre encuentros", "Material de apoyo descargable"],
      audience: ["Personas que buscan una transformación integral", "Quienes desean certificarse como terapeutas", "Quienes quieren un compromiso sostenido con su crecimiento"],
      benefits: ["Ahorro significativo respecto a cursos individuales", "Proceso completo y cohesionado", "Acompañamiento continuo por WhatsApp entre encuentros"],
      pricing_options: [
        { label: "Mensual", amount: 80, perUnit: "/mes" },
        { label: "Pago único", amount: 700, note: "Ahorras 100€", highlight: true },
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
      promo: {
        enabled: true,
        eyebrow: "Próximas fechas de inicio · Reiki Nivel I",
        title: "Comienza tu camino en Reiki",
        text: "El primer nivel de Reiki tiene **dos fechas de inicio confirmadas**. Elige la que mejor te convenga y reserva tu plaza con antelación.",
        dates: [{ label: "Primera fecha", value: "17 de mayo" }, { label: "Segunda fecha", value: "14 de junio" }],
        cta_label: null, cta_pricing_label: null, cta_amount: null,
      },
    },
  },
  {
    id: "8c817c0b-fd90-4a92-b863-47102e3d2be7",
    slug: "despertar-maestria",
    name: "Despertar de tu Maestría",
    description: "Certificación completa de Reiki Usui en 3 niveles. 2 encuentros por nivel con pausas de 3 meses entre cada nivel para una integración profunda. Un viaje de autodescubrimiento y maestría energética.",
    price: 150,
    type: "course",
    metadata: {
      subtitle: "Curso de Reiki · 3 niveles",
      badge: null,
      image_url: null,
      includes: ["6 encuentros en total (2 por nivel)", "Manual de cada nivel", "Certificado oficial por nivel", "Prácticas supervisadas", "Seguimiento entre niveles"],
      audience: ["Personas que desean aprender Reiki desde cero", "Terapeutas que quieren ampliar su formación", "Cualquier persona interesada en el bienestar energético"],
      benefits: ["Certificación reconocida", "Ritmo respetuoso con periodos de integración de 3 meses", "Enfoque práctico y vivencial"],
      pricing_options: [
        { label: "Nivel I · 2 encuentros", amount: 150 },
        { label: "Nivel II · 2 encuentros", amount: 200 },
        { label: "Nivel III · 2 encuentros", amount: 175 },
        { label: "Pack completo (3 niveles)", amount: 500, note: "Ahorras 25€", highlight: true },
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
      promo: {
        enabled: true,
        eyebrow: "Próximas fechas de inicio · Reiki Nivel I",
        title: "Comienza tu camino en Reiki",
        text: "El primer nivel de Reiki tiene **dos fechas de inicio confirmadas**. Elige la que mejor te convenga y reserva tu plaza con antelación.",
        dates: [{ label: "Primera fecha", value: "17 de mayo" }, { label: "Segunda fecha", value: "14 de junio" }],
        cta_label: "Inscribirme al Nivel I →", cta_pricing_label: "Nivel I · 2 encuentros", cta_amount: 150,
      },
    },
  },
  {
    id: "7158c001-d130-4682-980b-2d272ad5e0a5",
    slug: "viaje-interior",
    name: "Viaje hacia el Interior",
    description: "9 encuentros mensuales explorando en profundidad el sistema de chakras. Un viaje por los centros energéticos del cuerpo para comprender, equilibrar y potenciar tu energía vital.",
    price: 60,
    type: "course",
    metadata: {
      subtitle: "Curso de Chakras · 9 encuentros",
      badge: null,
      image_url: null,
      includes: ["9 encuentros mensuales", "Material teórico y práctico", "Meditaciones guiadas", "Ejercicios para casa", "Comunidad de apoyo"],
      audience: ["Personas interesadas en el sistema de chakras", "Practicantes de yoga o meditación", "Terapeutas que desean profundizar en energía"],
      benefits: ["Comprensión profunda del sistema energético", "Herramientas prácticas para el día a día", "Transformación sostenida mes a mes"],
      pricing_options: [
        { label: "Mensual (9 meses)", amount: 60, perUnit: "/mes" },
        { label: "Pago único", amount: 490, note: "Ahorras 50€", highlight: true },
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
      promo: { enabled: false },
    },
  },
];

const SITE_CONTENT: Record<string, unknown> = {
  home: {
    hero_title: "Reconecta con tu equilibrio interior",
    hero_subtitle: "Terapias energéticas y formación holística para tu bienestar integral",
    cta_primary_label: "Reservar sesión",
    cta_secondary_label: "Conoce el Reiki",
    reiki_title: "¿Qué es el Reiki?",
    reiki_text: "El Reiki es una técnica de canalización de energía universal que promueve la relajación profunda y activa los procesos naturales de sanación del cuerpo. No es una creencia ni una religión — es una herramienta práctica para mejorar tu bienestar físico, emocional y mental. A través de la imposición de manos, se trabaja con el campo energético para restaurar el equilibrio y la armonía.",
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
  },
  sobre_mi: {
    title: "Sobre nosotros",
    intro_paragraphs: [
      "En ReikiHolistik acompañamos procesos de bienestar y crecimiento personal a través de la energía del Reiki.",
      "Nuestra empresa nace en el año 2020, con el propósito de acercar terapias energéticas a más personas de una manera accesible, profunda y transformadora. Sin embargo, detrás de este proyecto hay una trayectoria mucho más amplia: 24 años de experiencia como terapeuta y Maestra de Reiki, dedicados al cuidado integral del cuerpo, la mente y el espíritu.",
      "A lo largo de estos años, hemos acompañado a numerosas personas en su camino hacia el equilibrio emocional, la sanación energética y el desarrollo personal.",
    ],
    philosophy_title: "Nuestra filosofía",
    philosophy_text: "Creemos en el poder de la energía Reiki para transformar vidas. Trabajamos desde el respeto, la escucha y la conexión, ofreciendo un espacio seguro donde cada persona puede reconectar consigo misma y avanzar en su proceso personal.",
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
    community_text: "Además de las sesiones individuales, en Reiki Holistik fomentamos la práctica grupal como espacio de crecimiento compartido. Los encuentros de meditación y las formaciones presenciales crean vínculos profundos entre los participantes, enriqueciendo el proceso de cada uno.",
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
    elisabet_closing: "Mi propósito es ofrecer un espacio de luz, conciencia y sanación, donde cada persona pueda reconectar consigo misma y con su propio potencial.",
  },
  instructor: {
    name: "Elisabet",
    title: "Maestra de Reiki Usui · Canalizadora y Médium",
    bio_short: [
      "Con más de 24 años de experiencia como terapeuta y Maestra de Reiki, Elisabet comenzó su camino espiritual en 1997 con el despertar de sus capacidades como canalizadora y médium. Se inició como terapeuta de Reiki en 2002 y se formó como Maestra de Reiki Usui Tradicional y Tibetano en 2011.",
      "Su labor integra su sensibilidad como canalizadora junto con su recorrido como terapeuta y maestra, acompañando desde un enfoque cercano, respetuoso y profundamente humano.",
    ],
    image_url: null,
  },
  contacto: {
    title: "Contacto",
    subtitle: "Escríbeme y te responderé lo antes posible",
    submit_label: "Enviar mensaje",
  },
  settings: {
    whatsapp_number: "34600000000",
    whatsapp_cta_label: "Contactar por WhatsApp",
    iban: "BE39905290167019",
  },
  sesiones: {
    title: "Sesiones de Reiki",
    subtitle: "Cada sesión es un espacio seguro y personalizado para tu bienestar",
    cards: [
      {
        serviceType: "individual", title: "Sesión individual", icon: "Sparkles",
        desc: "Una sesión completa de Reiki personalizada, adaptada a tus necesidades del momento. Ideal para una primera experiencia o para sesiones puntuales.",
        badge: null, buttonLabel: "Reservar",
        options: [{ slug: "sesion-presencial", label: "Presencial" }, { slug: "sesion-online", label: "Online" }],
      },
      {
        serviceType: "pack", title: "Pack 4 sesiones", icon: "Star",
        desc: "Trabajo profundo sobre los 4 cuerpos: físico, emocional, mental y espiritual. Un proceso de transformación integral en 4 encuentros.",
        badge: "Desbloquea la Membresía", buttonLabel: "Reservar",
        options: [
          { slug: "pack-4-sesiones", label: "Pack Online (4 sesiones)", pricingLabel: "Online" },
          { slug: "pack-4-sesiones", label: "Pack Presencial (4 sesiones)", pricingLabel: "Presencial" },
        ],
      },
      {
        serviceType: "membership", title: "Membresía", icon: "Lock",
        desc: "2 sesiones al mes (cada ~15 días) para mantener tu equilibrio energético de forma continua. Un acompañamiento regular para tu bienestar.",
        badgeLocked: "Requiere Pack de 4 o Formación", badgeUnlocked: "Acceso desbloqueado", buttonLabel: "Unirme",
        options: [{ slug: "membresia-online", label: "Membresía Online" }, { slug: "membresia-presencial", label: "Membresía Presencial" }],
      },
    ],
  },
  formacion_home: {
    title: "Tu transformación comienza aquí",
    subtitle: "Formación certificada en Reiki y Chakras. Aprende a canalizar energía y acompaña a otros en su camino de bienestar.",
  },
  cursos_page: {
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
  },
};

export function seedContentIfEmpty() {
  if (store.productCount() === 0) {
    for (const p of PRODUCTS) {
      store.upsertProduct({ ...p, updated_at: nowIso() });
    }
  }

  if (store.contentCount() === 0) {
    for (const [key, value] of Object.entries(SITE_CONTENT)) {
      store.setContent(key, value);
    }
  }
}
