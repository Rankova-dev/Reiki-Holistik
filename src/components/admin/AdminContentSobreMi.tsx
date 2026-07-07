import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useSaveSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { SOBRE_MI_DEFAULT, INSTRUCTOR_DEFAULT, type SobreMiContent, type InstructorContent } from "@/lib/contentDefaults";
import { StringListField } from "@/components/admin/RepeatableListField";
import ImageUploadField from "@/components/admin/ImageUploadField";
import mikaoUsuiImg from "@/assets/mikao-usui.jpg";
import simboloReikiImg from "@/assets/simbolo-reiki.png";
import chakraMandalaImg from "@/assets/chakra-mandala.png";
import meditacionImg from "@/assets/meditacion-grupo.jpg";
import terapeutaImg from "@/assets/terapeuta.jpg";

const AdminContentSobreMi = () => {
  const { content, isLoading } = useSiteContent("sobre_mi", SOBRE_MI_DEFAULT);
  const save = useSaveSiteContent("sobre_mi");
  const [form, setForm] = useState<SobreMiContent>(content);
  const [hydrated, setHydrated] = useState(false);

  const { content: instructorContent, isLoading: instructorLoading } = useSiteContent("instructor", INSTRUCTOR_DEFAULT);
  const saveInstructor = useSaveSiteContent("instructor");
  const [instructorForm, setInstructorForm] = useState<InstructorContent>(instructorContent);
  const [instructorHydrated, setInstructorHydrated] = useState(false);

  useEffect(() => {
    if (!isLoading && !hydrated) {
      setForm(content);
      setHydrated(true);
    }
  }, [isLoading, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!instructorLoading && !instructorHydrated) {
      setInstructorForm(instructorContent);
      setInstructorHydrated(true);
    }
  }, [instructorLoading, instructorHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Label>Título</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <StringListField
        label="Párrafos de introducción"
        items={form.intro_paragraphs}
        onChange={(intro_paragraphs) => setForm({ ...form, intro_paragraphs })}
      />
      <div>
        <Label>Título "Nuestra filosofía"</Label>
        <Input value={form.philosophy_title} onChange={(e) => setForm({ ...form, philosophy_title: e.target.value })} />
      </div>
      <div>
        <Label>Texto de filosofía</Label>
        <Textarea rows={3} value={form.philosophy_text} onChange={(e) => setForm({ ...form, philosophy_text: e.target.value })} />
      </div>

      <hr className="border-border" />

      <div>
        <Label>Título "Los orígenes del Reiki"</Label>
        <Input value={form.origins_title} onChange={(e) => setForm({ ...form, origins_title: e.target.value })} />
      </div>
      <StringListField
        label="Párrafos de los orígenes"
        items={form.origins_paragraphs}
        onChange={(origins_paragraphs) => setForm({ ...form, origins_paragraphs })}
      />
      <ImageUploadField
        label="Imagen de Mikao Usui"
        value={form.mikao_image_url}
        fallbackSrc={mikaoUsuiImg}
        onChange={(url) => setForm({ ...form, mikao_image_url: url })}
      />
      <div>
        <Label>Pie de foto de Mikao Usui</Label>
        <Input value={form.mikao_caption} onChange={(e) => setForm({ ...form, mikao_caption: e.target.value })} />
      </div>

      <hr className="border-border" />

      <div>
        <Label>Título "Energía, chakras y símbolos"</Label>
        <Input value={form.energy_title} onChange={(e) => setForm({ ...form, energy_title: e.target.value })} />
      </div>
      <StringListField
        label="Párrafos de energía y chakras"
        items={form.energy_paragraphs}
        onChange={(energy_paragraphs) => setForm({ ...form, energy_paragraphs })}
      />
      <ImageUploadField
        label="Imagen del símbolo Reiki"
        value={form.symbol_image_url}
        fallbackSrc={simboloReikiImg}
        onChange={(url) => setForm({ ...form, symbol_image_url: url })}
      />
      <div>
        <Label>Pie de foto del símbolo</Label>
        <Input value={form.symbol_caption} onChange={(e) => setForm({ ...form, symbol_caption: e.target.value })} />
      </div>
      <ImageUploadField
        label="Imagen del mandala de chakras"
        value={form.chakra_image_url}
        fallbackSrc={chakraMandalaImg}
        onChange={(url) => setForm({ ...form, chakra_image_url: url })}
      />

      <hr className="border-border" />

      <div>
        <Label>Título "La práctica en comunidad"</Label>
        <Input value={form.community_title} onChange={(e) => setForm({ ...form, community_title: e.target.value })} />
      </div>
      <div>
        <Label>Texto de comunidad</Label>
        <Textarea rows={3} value={form.community_text} onChange={(e) => setForm({ ...form, community_text: e.target.value })} />
      </div>
      <ImageUploadField
        label="Imagen de comunidad"
        value={form.community_image_url}
        fallbackSrc={meditacionImg}
        onChange={(url) => setForm({ ...form, community_image_url: url })}
      />

      <hr className="border-border" />

      <div>
        <Label>Título "Sobre mí"</Label>
        <Input value={form.elisabet_title} onChange={(e) => setForm({ ...form, elisabet_title: e.target.value })} />
      </div>
      <ImageUploadField
        label="Foto de Elisabet"
        value={form.elisabet_image_url}
        fallbackSrc={terapeutaImg}
        onChange={(url) => setForm({ ...form, elisabet_image_url: url })}
      />
      <StringListField
        label="Párrafos de la biografía"
        items={form.elisabet_paragraphs}
        onChange={(elisabet_paragraphs) => setForm({ ...form, elisabet_paragraphs })}
      />
      <div>
        <Label>Frase de cierre</Label>
        <Textarea value={form.elisabet_closing} onChange={(e) => setForm({ ...form, elisabet_closing: e.target.value })} />
      </div>

      <Button
        onClick={() => save.mutate(form, { onSuccess: () => toast.success("Cambios guardados") })}
        disabled={save.isPending}
      >
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </Button>

      <hr className="border-border" />

      <div>
        <h3 className="font-heading text-lg font-medium mb-1">Instructora (usado también en las páginas de cursos)</h3>
      </div>
      {instructorLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div>
            <Label>Nombre</Label>
            <Input value={instructorForm.name} onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })} />
          </div>
          <div>
            <Label>Título / especialidad</Label>
            <Input value={instructorForm.title} onChange={(e) => setInstructorForm({ ...instructorForm, title: e.target.value })} />
          </div>
          <ImageUploadField
            label="Foto"
            value={instructorForm.image_url}
            fallbackSrc={terapeutaImg}
            onChange={(url) => setInstructorForm({ ...instructorForm, image_url: url })}
          />
          <StringListField
            label="Biografía breve (párrafos)"
            items={instructorForm.bio_short}
            onChange={(bio_short) => setInstructorForm({ ...instructorForm, bio_short })}
          />
          <Button
            onClick={() => saveInstructor.mutate(instructorForm, { onSuccess: () => toast.success("Cambios guardados") })}
            disabled={saveInstructor.isPending}
          >
            {saveInstructor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </Button>
        </>
      )}
    </div>
  );
};

export default AdminContentSobreMi;
