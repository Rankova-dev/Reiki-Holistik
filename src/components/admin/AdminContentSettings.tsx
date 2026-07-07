import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useSaveSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { SETTINGS_DEFAULT, type SettingsContent } from "@/lib/contentDefaults";

const AdminContentSettings = () => {
  const { content, isLoading } = useSiteContent("settings", SETTINGS_DEFAULT);
  const save = useSaveSiteContent("settings");
  const [form, setForm] = useState<SettingsContent>(content);
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
        <Label>Número de WhatsApp (formato internacional, solo dígitos, ej. 34600000000)</Label>
        <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
      </div>
      <div>
        <Label>Texto del botón de WhatsApp</Label>
        <Input value={form.whatsapp_cta_label} onChange={(e) => setForm({ ...form, whatsapp_cta_label: e.target.value })} />
      </div>
      <div>
        <Label>IBAN para transferencias</Label>
        <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
      </div>
      <Button onClick={() => save.mutate(form, { onSuccess: () => toast.success("Cambios guardados") })} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </Button>
    </div>
  );
};

export default AdminContentSettings;
