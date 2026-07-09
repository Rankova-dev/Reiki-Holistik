import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Eye, Loader2, ShieldAlert, CreditCard, Users, CalendarDays, Trash2, BarChart2, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminGroupSessions from "@/components/admin/AdminGroupSessions";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminContentHome from "@/components/admin/AdminContentHome";
import AdminContentSobreMi from "@/components/admin/AdminContentSobreMi";
import AdminContentProducts from "@/components/admin/AdminContentProducts";
import AdminContentSesionesTexts from "@/components/admin/AdminContentSesionesTexts";
import AdminContentContacto from "@/components/admin/AdminContentContacto";
import AdminContentSettings from "@/components/admin/AdminContentSettings";
import AdminContentLogin from "@/components/admin/AdminContentLogin";

const Admin = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<"requests" | "credits" | "group-sessions" | "analytics" | "content">("requests");
  const [contentTab, setContentTab] = useState("home");

  const isAdmin = user?.role === "admin";

  // Payment requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-payment-requests"],
    queryFn: () => api.allPaymentRequests(),
    enabled: !!isAdmin,
  });

  // Users for display names
  const userIds = [...new Set(requests.map((r: any) => r.user_id))];
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles", userIds],
    queryFn: () => api.adminUsersByIds(userIds),
    enabled: userIds.length > 0,
  });

  // Session credits overview
  const { data: allCredits = [] } = useQuery({
    queryKey: ["admin-credits"],
    queryFn: () => api.allSessionCredits(),
    enabled: !!isAdmin,
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p.name || p.email]));

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api.updatePaymentRequestStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-credits"] });
      toast.success(status === "approved" ? "Acceso concedido y créditos creados" : "Solicitud rechazada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) => api.deletePaymentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-requests"] });
      toast.success("Solicitud eliminada");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const viewProof = async (proofPath: string) => {
    try {
      setPreviewUrl(await api.fetchPaymentProofBlobUrl(proofPath));
    } catch {
      toast.error("No se pudo cargar el justificante");
    }
  };

  if (loading) return <div className="py-24 text-center text-muted-foreground">Cargando...</div>;

  if (!isAdmin) {
    return (
      <div className="py-24 px-6 text-center min-h-[60vh] flex items-center justify-center">
        <div>
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-medium mb-2">Acceso denegado</h1>
          <p className="text-muted-foreground font-body text-sm">No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl md:text-4xl font-light italic text-lavender-deep mb-2">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground font-body font-light mb-8">
          Gestión de solicitudes de pago, créditos y acceso a formaciones
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("requests")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
              tab === "requests" ? "bg-earth-deep text-cream" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Users className="w-4 h-4" /> Solicitudes de pago
          </button>
          <button
            onClick={() => setTab("credits")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
              tab === "credits" ? "bg-earth-deep text-cream" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Créditos de sesión
          </button>
          <button
            onClick={() => setTab("group-sessions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
              tab === "group-sessions" ? "bg-earth-deep text-cream" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Sesiones grupales
          </button>
          <button
            onClick={() => setTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
              tab === "analytics" ? "bg-earth-deep text-cream" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analíticas
          </button>
          <button
            onClick={() => setTab("content")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-colors ${
              tab === "content" ? "bg-earth-deep text-cream" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <FileEdit className="w-4 h-4" /> Contenido
          </button>
        </div>

        {tab === "requests" && (
          <>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-body">
                No hay solicitudes de pago todavía.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4">Usuario</th>
                      <th className="pb-3 pr-4">Producto</th>
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3 pr-4">Opción</th>
                      <th className="pb-3 pr-4">Formato</th>
                      <th className="pb-3 pr-4">Importe</th>
                      <th className="pb-3 pr-4">Fecha</th>
                      <th className="pb-3 pr-4">Justificante</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req: any) => (
                      <tr key={req.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{profileMap[req.user_id] || "—"}</p>
                          <p className="text-xs text-muted-foreground">{req.user_id.slice(0, 8)}...</p>
                        </td>
                        <td className="py-3 pr-4">{req.products?.name || "—"}</td>
                        <td className="py-3 pr-4 text-xs">{req.products?.type || "—"}</td>
                        <td className="py-3 pr-4 text-xs">{req.pricing_option}</td>
                        <td className="py-3 pr-4 text-xs capitalize">{req.format || "online"}</td>
                        <td className="py-3 pr-4 font-medium">{req.amount}€</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 pr-4">
                          {req.proof_url ? (
                            <button
                              onClick={() => viewProof(req.proof_url)}
                              className="text-lavender-deep hover:underline flex items-center gap-1 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </button>
                          ) : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {req.status === "approved" ? "Aprobado" : req.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus.mutate({ id: req.id, status: "approved" })}
                                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                  title="Aprobar y dar acceso"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateStatus.mutate({ id: req.id, status: "rejected" })}
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Rechazar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (confirm("¿Eliminar esta solicitud? Esta acción no se puede deshacer.")) {
                                  deleteRequest.mutate(req.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Eliminar solicitud"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "credits" && (
          <div className="overflow-x-auto">
            {allCredits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-body">
                No hay créditos de sesión todavía.
              </div>
            ) : (
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4">Usuario</th>
                    <th className="pb-3 pr-4">Producto</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3 pr-4">Usado</th>
                    <th className="pb-3 pr-4">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {allCredits.map((credit: any) => (
                    <tr key={credit.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{profileMap[credit.user_id] || credit.user_id.slice(0, 8) + "..."}</p>
                      </td>
                      <td className="py-3 pr-4">{credit.products?.name || "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          credit.status === "available"
                            ? "bg-green-100 text-green-700"
                            : credit.status === "used"
                            ? "bg-muted text-muted-foreground"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {credit.status === "available" ? "Disponible" : credit.status === "used" ? "Usado" : "Expirado"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {credit.used_at ? new Date(credit.used_at).toLocaleDateString("es-ES") : "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {new Date(credit.created_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "group-sessions" && <AdminGroupSessions />}
        {tab === "analytics" && <AdminAnalytics />}

        {tab === "content" && (
          <AdminContentLogin>
            <Tabs value={contentTab} onValueChange={setContentTab}>
              <TabsList className="mb-6 flex-wrap h-auto">
                <TabsTrigger value="home">Inicio</TabsTrigger>
                <TabsTrigger value="sobre-mi">Sobre mí</TabsTrigger>
                <TabsTrigger value="sesiones-cursos">Sesiones y Cursos</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="settings">Ajustes generales</TabsTrigger>
              </TabsList>
              <TabsContent value="home"><AdminContentHome /></TabsContent>
              <TabsContent value="sobre-mi"><AdminContentSobreMi /></TabsContent>
              <TabsContent value="sesiones-cursos">
                <div className="space-y-10">
                  <AdminContentProducts />
                  <hr className="border-border" />
                  <AdminContentSesionesTexts />
                </div>
              </TabsContent>
              <TabsContent value="contacto"><AdminContentContacto /></TabsContent>
              <TabsContent value="settings"><AdminContentSettings /></TabsContent>
            </Tabs>
          </AdminContentLogin>
        )}
      </div>

      {/* Proof preview dialog */}
      <Dialog
        open={!!previewUrl}
        onOpenChange={() => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          {previewUrl && (
            <img src={previewUrl} alt="Justificante de pago" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
