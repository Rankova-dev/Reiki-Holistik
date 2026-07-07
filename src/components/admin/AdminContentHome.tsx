import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useSaveSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { HOME_DEFAULT, type HomeContent } from "@/lib/contentDefaults";
import { RepeatableListField } from "@/components/admin/RepeatableListField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { ICON_NAMES } from "@/lib/iconMap";
import energiaManosImg from "@/assets/energia-manos.jpg";

const AdminContentHome = () => {
  const { content, isLoading } = useSiteContent("home", HOME_DEFAULT);
  const save = useSaveSiteContent("home");
  const [form, setForm] = useState<HomeContent>(content);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isLoading && !hydrated) {
      setForm(content);
      setHydrated(true);
    }
  }, [isLoading, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Label>Título principal</Label>
        <Input value={form.hero_title} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} />
      </div>
      <div>
        <Label>Subtítulo</Label>
        <Textarea value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Botón principal</Label>
          <Input value={form.cta_primary_label} onChange={(e) => setForm({ ...form, cta_primary_label: e.target.value })} />
        </div>
        <div>
          <Label>Botón secundario</Label>
          <Input value={form.cta_secondary_label} onChange={(e) => setForm({ ...form, cta_secondary_label: e.target.value })} />
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <Label>Título "Qué es el Reiki"</Label>
        <Input value={form.reiki_title} onChange={(e) => setForm({ ...form, reiki_title: e.target.value })} />
      </div>
      <div>
        <Label>Texto "Qué es el Reiki"</Label>
        <Textarea rows={4} value={form.reiki_text} onChange={(e) => setForm({ ...form, reiki_text: e.target.value })} />
      </div>
      <ImageUploadField
        label="Imagen de la sección"
        value={form.reiki_image_url}
        fallbackSrc={energiaManosImg}
        onChange={(url) => setForm({ ...form, reiki_image_url: url })}
      />

      <hr className="border-border" />

      <div>
        <Label>Título beneficios</Label>
        <Input value={form.benefits_title} onChange={(e) => setForm({ ...form, benefits_title: e.target.value })} />
      </div>
      <p className="text-xs text-muted-foreground font-body">
        Iconos disponibles: {ICON_NAMES.join(", ")}
      </p>
      <RepeatableListField
        label="Beneficios"
        items={form.benefits}
        onChange={(benefits) => setForm({ ...form, benefits })}
        emptyItem={{ icon: "Sparkles", title: "", desc: "" }}
        fields={[
          { key: "icon", label: "Icono" },
          { key: "title", label: "Título" },
          { key: "desc", label: "Descripción", type: "textarea" },
        ]}
      />

      <hr className="border-border" />

      <div>
        <Label>Título "Tu camino de transformación"</Label>
        <Input value={form.steps_title} onChange={(e) => setForm({ ...form, steps_title: e.target.value })} />
      </div>
      <RepeatableListField
        label="Pasos"
        items={form.steps}
        onChange={(steps) => setForm({ ...form, steps })}
        emptyItem={{ label: "", desc: "" }}
        fields={[
          { key: "label", label: "Título" },
          { key: "desc", label: "Descripción" },
        ]}
      />

      <hr className="border-border" />

      <div>
        <Label>Título CTA final</Label>
        <Input value={form.cta_title} onChange={(e) => setForm({ ...form, cta_title: e.target.value })} />
      </div>
      <div>
        <Label>Texto CTA final</Label>
        <Textarea value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
      </div>
      <div>
        <Label>Texto del botón (WhatsApp)</Label>
        <Input value={form.cta_button_label} onChange={(e) => setForm({ ...form, cta_button_label: e.target.value })} />
      </div>

      <Button
        onClick={() => save.mutate(form, { onSuccess: () => toast.success("Cambios guardados") })}
        disabled={save.isPending}
      >
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </Button>
    </div>
  );
};

export default AdminContentHome;
