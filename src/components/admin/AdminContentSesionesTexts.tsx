import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useSaveSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import {
  SESIONES_DEFAULT, CURSOS_PAGE_DEFAULT, FORMACION_HOME_DEFAULT,
  type SesionesContent, type CursosPageContent, type FormacionHomeContent,
} from "@/lib/contentDefaults";

const AdminContentSesionesTexts = () => {
  const { content: sesiones, isLoading: l1 } = useSiteContent("sesiones", SESIONES_DEFAULT);
  const saveSesiones = useSaveSiteContent("sesiones");
  const [sesionesForm, setSesionesForm] = useState<SesionesContent>(sesiones);
  const [h1, setH1] = useState(false);

  const { content: cursosPage, isLoading: l2 } = useSiteContent("cursos_page", CURSOS_PAGE_DEFAULT);
  const saveCursosPage = useSaveSiteContent("cursos_page");
  const [cursosForm, setCursosForm] = useState<CursosPageContent>(cursosPage);
  const [h2, setH2] = useState(false);

  const { content: formacionHome, isLoading: l3 } = useSiteContent("formacion_home", FORMACION_HOME_DEFAULT);
  const saveFormacionHome = useSaveSiteContent("formacion_home");
  const [formacionForm, setFormacionForm] = useState<FormacionHomeContent>(formacionHome);
  const [h3, setH3] = useState(false);

  useEffect(() => { if (!l1 && !h1) { setSesionesForm(sesiones); setH1(true); } }, [l1, h1]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!l2 && !h2) { setCursosForm(cursosPage); setH2(true); } }, [l2, h2]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!l3 && !h3) { setFormacionForm(formacionHome); setH3(true); } }, [l3, h3]); // eslint-disable-line react-hooks/exhaustive-deps

  if (l1 || l2 || l3) return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;

  const updateCard = (i: number, patch: Partial<SesionesContent["cards"][number]>) => {
    const cards = sesionesForm.cards.slice();
    cards[i] = { ...cards[i], ...patch };
    setSesionesForm({ ...sesionesForm, cards });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Página "Sesiones de Reiki"</h3>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={sesionesForm.title} onChange={(e) => setSesionesForm({ ...sesionesForm, title: e.target.value })} />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={sesionesForm.subtitle} onChange={(e) => setSesionesForm({ ...sesionesForm, subtitle: e.target.value })} />
          </div>
          {sesionesForm.cards.map((card, i) => (
            <div key={card.serviceType} className="border border-border rounded-lg p-4 space-y-2">
              <p className="text-xs font-body font-medium text-muted-foreground uppercase">{card.serviceType}</p>
              <Input placeholder="Título" value={card.title} onChange={(e) => updateCard(i, { title: e.target.value })} />
              <Textarea placeholder="Descripción" value={card.desc} onChange={(e) => updateCard(i, { desc: e.target.value })} />
              <Input placeholder="Texto del botón" value={card.buttonLabel} onChange={(e) => updateCard(i, { buttonLabel: e.target.value })} />
              {card.serviceType === "membership" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Distintivo (bloqueada)" value={card.badgeLocked || ""} onChange={(e) => updateCard(i, { badgeLocked: e.target.value })} />
                  <Input placeholder="Distintivo (desbloqueada)" value={card.badgeUnlocked || ""} onChange={(e) => updateCard(i, { badgeUnlocked: e.target.value })} />
                </div>
              ) : (
                <Input placeholder="Distintivo (vacío = ninguno)" value={card.badge || ""} onChange={(e) => updateCard(i, { badge: e.target.value })} />
              )}
            </div>
          ))}
          <Button onClick={() => saveSesiones.mutate(sesionesForm, { onSuccess: () => toast.success("Cambios guardados") })} disabled={saveSesiones.isPending}>
            {saveSesiones.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Página "Cursos y Formación" (/formacion/cursos)</h3>
        <div className="space-y-4">
          <Input placeholder="Título" value={cursosForm.title} onChange={(e) => setCursosForm({ ...cursosForm, title: e.target.value })} />
          <Input placeholder="Subtítulo" value={cursosForm.subtitle} onChange={(e) => setCursosForm({ ...cursosForm, subtitle: e.target.value })} />
          <p className="text-xs font-body font-medium text-muted-foreground uppercase pt-2">Bloque Membresía</p>
          <Input placeholder="Título" value={cursosForm.membership_title} onChange={(e) => setCursosForm({ ...cursosForm, membership_title: e.target.value })} />
          <Input placeholder="Distintivo" value={cursosForm.membership_badge} onChange={(e) => setCursosForm({ ...cursosForm, membership_badge: e.target.value })} />
          <Textarea placeholder="Texto" value={cursosForm.membership_text} onChange={(e) => setCursosForm({ ...cursosForm, membership_text: e.target.value })} />
          <Input placeholder="Texto del botón" value={cursosForm.membership_button_label} onChange={(e) => setCursosForm({ ...cursosForm, membership_button_label: e.target.value })} />
          <p className="text-xs font-body font-medium text-muted-foreground uppercase pt-2">Bloque Masterclass</p>
          <Input placeholder="Título" value={cursosForm.masterclass_title} onChange={(e) => setCursosForm({ ...cursosForm, masterclass_title: e.target.value })} />
          <Input placeholder="Distintivo" value={cursosForm.masterclass_badge} onChange={(e) => setCursosForm({ ...cursosForm, masterclass_badge: e.target.value })} />
          <Textarea placeholder="Texto" value={cursosForm.masterclass_text} onChange={(e) => setCursosForm({ ...cursosForm, masterclass_text: e.target.value })} />
          <Input placeholder="Texto del botón" value={cursosForm.masterclass_button_label} onChange={(e) => setCursosForm({ ...cursosForm, masterclass_button_label: e.target.value })} />
          <Button onClick={() => saveCursosPage.mutate(cursosForm, { onSuccess: () => toast.success("Cambios guardados") })} disabled={saveCursosPage.isPending}>
            {saveCursosPage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </Button>
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="font-heading text-lg font-medium mb-4">Página "Formación" (/formacion)</h3>
        <div className="space-y-4">
          <Input placeholder="Título" value={formacionForm.title} onChange={(e) => setFormacionForm({ ...formacionForm, title: e.target.value })} />
          <Textarea placeholder="Subtítulo" value={formacionForm.subtitle} onChange={(e) => setFormacionForm({ ...formacionForm, subtitle: e.target.value })} />
          <Button onClick={() => saveFormacionHome.mutate(formacionForm, { onSuccess: () => toast.success("Cambios guardados") })} disabled={saveFormacionHome.isPending}>
            {saveFormacionHome.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminContentSesionesTexts;
