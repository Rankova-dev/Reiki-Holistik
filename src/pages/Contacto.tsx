import { motion } from "framer-motion";
import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { CONTACTO_DEFAULT } from "@/lib/contentDefaults";

const Contacto = () => {
  const { content: c } = useSiteContent("contacto", CONTACTO_DEFAULT);
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase or email integration
    alert("Mensaje enviado. ¡Gracias por contactar!");
  };

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-4xl md:text-5xl font-light italic text-lavender-deep mb-4 text-center">
            {c.title}
          </h1>
          <p className="text-center text-muted-foreground font-body font-light mb-12">
            {c.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-body font-medium mb-1.5 text-foreground">Nombre</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-1.5 text-foreground">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-1.5 text-foreground">Servicio</label>
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50"
              >
                <option value="">Selecciona un servicio</option>
                <option value="individual">Sesión individual</option>
                <option value="pack4">Pack 4 sesiones</option>
                <option value="membresia">Membresía</option>
                <option value="formacion">Formación</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-1.5 text-foreground">Mensaje</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-lavender/50 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {c.submit_label}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contacto;
