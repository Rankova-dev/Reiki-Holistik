import { useState } from "react";
import { api } from "@/lib/api";
import { contentApi } from "@/lib/contentApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Users, ChevronDown, ChevronUp, CheckCircle, XCircle, Video } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";




const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

const FORMAT_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "presencial", label: "Presencial" },
];

interface SessionForm {
  course_id: string;
  title: string;
  proposed_datetime: string;
  duration_minutes: number;
  format: string;
  status: string;
  admin_notes: string;
}

const emptyForm: SessionForm = {
  course_id: "",
  title: "",
  proposed_datetime: "",
  duration_minutes: 240,
  format: "online",
  status: "draft",
  admin_notes: "",
};

const AdminGroupSessions = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SessionForm>(emptyForm);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Fetch products (courses) for dropdown
  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-courses"],
    queryFn: () => contentApi.getProducts(),
  });
  const products = allProducts.filter((p: any) => p.type === "course");

  // Fetch all group sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["admin-group-sessions"],
    queryFn: () => api.adminGroupSessions(),
  });

  const notesMap = Object.fromEntries(sessions.map((s: any) => [s.id, s.admin_notes]));

  // Fetch attendance for all sessions
  const sessionIds = sessions.map((s: any) => s.id);
  const { data: allAttendance = [] } = useQuery({
    queryKey: ["admin-attendance", sessionIds],
    queryFn: async () => {
      const lists = await Promise.all(sessionIds.map((id: string) => api.sessionAttendance(id)));
      return lists.flat().filter((a: any) => !a.cancelled_at);
    },
    enabled: sessionIds.length > 0,
  });

  const profileMap = Object.fromEntries(
    allAttendance.map((a: any) => [a.user_id, a.users?.name || a.users?.email])
  );

  const saveMutation = useMutation({
    mutationFn: async (data: SessionForm & { id?: string }) => {
      if (data.id) {
        const { id, ...rest } = data;
        await api.updateGroupSession(id, rest);
      } else {
        await api.createGroupSession(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group-sessions"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Sesión actualizada" : "Sesión creada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteGroupSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-group-sessions"] });
      toast.success("Sesión eliminada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleAttended = useMutation({
    mutationFn: ({ id, attended }: { id: string; attended: boolean }) => api.toggleAttendance(id, attended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-attendance"] });
      toast.success("Asistencia actualizada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openEdit = (session: any) => {
    setForm({
      course_id: session.course_id,
      title: session.title,
      proposed_datetime: session.proposed_datetime?.slice(0, 16) || "",
      duration_minutes: session.duration_minutes,
      format: session.format,
      status: session.status,
      admin_notes: notesMap[session.id] || "",
    });
    setEditingId(session.id);
    setShowForm(true);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title || !form.proposed_datetime) {
      toast.error("Rellena los campos obligatorios");
      return;
    }
    // Convert local datetime-local value to proper ISO with timezone
    // datetime-local gives "2026-04-16T12:33" without timezone info
    // We need to create a Date from it (which treats it as local) and convert to ISO
    const localDate = new Date(form.proposed_datetime);
    const isoDatetime = localDate.toISOString();
    const submitData = { ...form, proposed_datetime: isoDatetime };
    saveMutation.mutate(editingId ? { ...submitData, id: editingId } : submitData);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      draft: "Borrador",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    };
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getSessionAttendance = (sessionId: string) =>
    allAttendance.filter((a: any) => a.session_id === sessionId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-medium">Sesiones grupales</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-earth-deep text-cream rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Nueva sesión
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground font-body text-sm py-8 text-center">Cargando...</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm py-8 text-center">No hay sesiones grupales todavía.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: any) => {
            const attendance = getSessionAttendance(session.id);
            const isExpanded = expandedSession === session.id;

            return (
              <div key={session.id} className="border border-border/50 rounded-xl p-5 bg-background/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-body text-sm font-medium">{session.title}</h3>
                      {statusBadge(session.status)}
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      {session.products?.name} · {new Date(session.proposed_datetime).toLocaleDateString("es-ES", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })} · {session.duration_minutes} min · {session.format}
                    </p>
                    {notesMap[session.id] && (
                      <p className="text-xs text-muted-foreground/70 font-body mt-1 italic">📝 {notesMap[session.id]}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {session.jitsi_room_url && (
                      <a
                        href={session.jitsi_room_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lavender/20 text-lavender-deep hover:bg-lavender/40 text-xs font-body font-medium transition-colors"
                        title="Entrar a la sala Jitsi"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Unirse
                      </a>
                    )}
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent text-xs font-body transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {attendance.length}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button onClick={() => openEdit(session)} className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar esta sesión?")) deleteMutation.mutate(session.id);
                      }}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Attendance list */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs font-body font-medium text-muted-foreground mb-3">
                      {attendance.length} alumna{attendance.length !== 1 ? "s" : ""} apuntada{attendance.length !== 1 ? "s" : ""}
                    </p>
                    {attendance.length === 0 ? (
                      <p className="text-xs text-muted-foreground/70 font-body">Nadie se ha apuntado aún.</p>
                    ) : (
                      <div className="space-y-2">
                        {attendance.map((att: any) => (
                          <div key={att.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-body font-medium">{profileMap[att.user_id] || att.user_id.slice(0, 8) + "..."}</p>
                              <p className="text-xs text-muted-foreground font-body">
                                Apuntada: {new Date(att.registered_at).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleAttended.mutate({ id: att.id, attended: !att.attended })}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${
                                att.attended
                                  ? "bg-green-100 text-green-700"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              {att.attended ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {att.attended ? "Asistió" : "No asistió"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditingId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {editingId ? "Editar sesión grupal" : "Nueva sesión grupal"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Course */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Curso *</label>
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
              >
                <option value="">Seleccionar curso...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Encuentro 1 — Reiki Nivel I"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
              />
            </div>

            {/* Date/Time */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Fecha y hora *</label>
              <input
                type="datetime-local"
                value={form.proposed_datetime}
                onChange={(e) => setForm({ ...form, proposed_datetime: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Duración (min)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 240 })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
                />
              </div>

              {/* Format */}
              <div>
                <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Formato</label>
                <select
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
                >
                  {FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Notas (solo admin)</label>
              <textarea
                value={form.admin_notes}
                onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                rows={3}
                placeholder="Notas internas..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 rounded-full font-body text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-earth-deep text-cream rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saveMutation.isPending ? "Guardando..." : editingId ? "Actualizar" : "Crear sesión"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGroupSessions;
