import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useSaveSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { CONTACTO_DEFAULT, type ContactoContent } from "@/lib/contentDefaults";

const AdminContentContacto = () => {
  const { content, isLoading } = useSiteContent("contacto", CONTACTO_DEFAULT);
  const save = useSaveSiteContent("contacto");
  const [form, setForm] = useState<ContactoContent>(content);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isLoading && !hydrated) {
      setForm(content);
      setHydrated(true);
    }
  }, [isLoading, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <Label>Título</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <Label>Subtítulo</Label>
        <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </div>
      <div>
        <Label>Texto del botón de envío</Label>
        <Input value={form.submit_label} onChange={(e) => setForm({ ...form, submit_label: e.target.value })} />
      </div>
      <Button onClick={() => save.mutate(form, { onSuccess: () => toast.success("Cambios guardados") })} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </Button>
    </div>
  );
};

export default AdminContentContacto;
