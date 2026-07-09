import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Play, CheckCircle, ChevronRight, Calendar, AlertTriangle, Users, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import VideoLesson from "@/components/VideoLesson";
import GroupSessionsList from "@/components/GroupSessionsList";
import RenewalPaymentDialog from "@/components/RenewalPaymentDialog";
import UpcomingBookings from "@/components/UpcomingBookings";

const MiBiblioteca = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalProduct, setRenewalProduct] = useState<{ id: string; name: string; amount: number } | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch user's purchased products
  const { data: purchases = [] } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: () => api.myPurchases(),
    enabled: !!user,
  });

  // Separate active vs expired purchases
  const now = new Date().toISOString();
  const activePurchases = purchases.filter((p: any) => !p.expires_at || p.expires_at > now);
  const expiredPurchases = purchases.filter((p: any) => p.expires_at && p.expires_at <= now);

  // Check if there's a pending renewal request for expired purchases
  const { data: allMyRequests = [] } = useQuery({
    queryKey: ["my-requests-for-renewal", user?.id],
    queryFn: () => api.myPaymentRequests(),
    enabled: !!user && expiredPurchases.length > 0,
  });
  const pendingRenewals = allMyRequests.filter(
    (r: any) => r.status === "pending" && /mensual/i.test(r.pricing_option || "")
  );

  const hasPendingRenewal = (productId: string) =>
    pendingRenewals.some((r: any) => r.product_id === productId);

  // Get all product IDs the user has ACTIVE access to
  const purchasedProductIds = activePurchases.map((p: any) => p.product_id);

  // If only one active course, auto-select it
  useEffect(() => {
    if (activePurchases.length === 1 && !selectedCourseId) {
      setSelectedCourseId(activePurchases[0].product_id);
    }
  }, [activePurchases, selectedCourseId]);

  const effectiveProductIds = selectedCourseId ? [selectedCourseId] : purchasedProductIds;

  // Selected course info (slug) — used to gate content behind first encounter
  const selectedPurchase = activePurchases.find((p: any) => p.product_id === selectedCourseId);
  const selectedSlug: string | undefined = selectedPurchase?.products?.slug;
  const requiresFirstEncounter =
    selectedSlug === "curso-completo" ||
    selectedSlug === "despertar-maestria" ||
    selectedSlug === "reiki-nivel-1" ||
    selectedSlug === "reiki-nivel-2" ||
    selectedSlug === "reiki-nivel-3";

  // Fetch user's attended/registered past group sessions for the selected course
  const { data: attendedEncounters = [] } = useQuery({
    queryKey: ["attended-encounters", user?.id, selectedCourseId],
    queryFn: () => api.attendedForCourse(selectedCourseId!),
    enabled: !!user && !!selectedCourseId && requiresFirstEncounter,
  });

  const firstEncounterDone = !requiresFirstEncounter || attendedEncounters.length > 0;

  // Fetch course content for purchased products
  const { data: lessons = [] } = useQuery({
    queryKey: ["my-lessons", effectiveProductIds],
    queryFn: () => api.courseContent(effectiveProductIds),
    enabled: effectiveProductIds.length > 0,
  });

  // Fetch user progress
  const { data: progress = [] } = useQuery({
    queryKey: ["my-progress", user?.id],
    queryFn: () => api.myProgress(),
    enabled: !!user,
  });

  // Fetch short-lived streaming URLs for video/PDF content (mirrors the old Supabase signed URLs)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateUrls = async () => {
      const urls: Record<string, string> = {};
      const pdfs: Record<string, string> = {};
      for (const lesson of lessons) {
        if (lesson.video_path) {
          const { url } = await api.videoUrl(lesson.id);
          urls[lesson.id] = url;
        }
        if (lesson.downloadable_path) {
          const { url } = await api.pdfUrl(lesson.id);
          pdfs[lesson.id] = url;
        }
      }
      setSignedUrls(urls);
      setPdfUrls(pdfs);
    };
    if (lessons.length > 0) {
      generateUrls();
    }
  }, [lessons]);

  // Mark lesson as completed
  const markComplete = useMutation({
    mutationFn: (contentId: string) => api.markProgress(contentId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-progress"] });
    },
  });

  const isCompleted = (contentId: string) =>
    progress.some((p: any) => p.course_content_id === contentId && p.completed);

  const isUnlocked = (index: number) => {
    if (!firstEncounterDone) return false;
    if (index === 0) return true;
    const current = lessons[index];
    // PDFs (no video) require ALL previous video lessons to be completed
    if (current && !current.video_path && current.downloadable_path) {
      return lessons
        .slice(0, index)
        .filter((l: any) => l.video_path)
        .every((l: any) => isCompleted(l.id));
    }
    return isCompleted(lessons[index - 1]?.id);
  };

  const completedCount = lessons.filter((l: any) => isCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const allCompleted = lessons.length > 0 && completedCount === lessons.length;

  // Not logged in — show locked screen
  if (!loading && !user) {
    return (
      <div className="py-24 px-6 text-center min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-light mb-4">Accede a tu biblioteca</h1>
          <p className="text-muted-foreground font-body font-light mb-8 max-w-md mx-auto">
            Inicia sesión para acceder a tus cursos y materiales de formación.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
          <p className="text-sm text-muted-foreground font-body mt-6">
            ¿Aún no tienes cursos?{" "}
            <Link to="/formacion" className="text-lavender-deep hover:underline">Explora nuestras formaciones</Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // No active purchases — check if all expired
  if (activePurchases.length === 0 && expiredPurchases.length === 0) {
    return (
      <div className="py-24 px-6 text-center min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-light mb-4">Tu biblioteca está vacía</h1>
          <p className="text-muted-foreground font-body font-light mb-8 max-w-md mx-auto">
            Adquiere una formación para desbloquear tus contenidos. Los videos, materiales y sesiones te esperan.
          </p>
          <Link
            to="/formacion"
            className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Explorar formaciones
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl md:text-4xl font-light italic text-lavender-deep mb-2">
            Mi Biblioteca
          </h1>
          <p className="text-muted-foreground font-body font-light mb-8">
            Tu camino de formación paso a paso
          </p>

          {/* Course selector — when multiple courses and none selected */}
          {activePurchases.length > 1 && !selectedCourseId && (
            <div className="mb-10">
              <h2 className="font-heading text-xl font-medium mb-4">Elige el curso que quieres ver</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {activePurchases.map((purchase: any) => (
                  <button
                    key={purchase.id}
                    onClick={() => setSelectedCourseId(purchase.product_id)}
                    className="text-left rounded-xl border border-border/50 bg-background p-6 hover:border-lavender/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-lavender/15 flex items-center justify-center flex-shrink-0 group-hover:bg-lavender-deep/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-lavender-deep" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-medium mb-1">
                          {purchase.products?.name || "Curso"}
                        </h3>
                        {purchase.products?.description && (
                          <p className="text-sm text-muted-foreground font-body font-light line-clamp-2">
                            {purchase.products.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 mt-3 text-xs font-body font-medium text-lavender-deep">
                          Ver contenidos <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Back to course list (when more than one course) */}
          {activePurchases.length > 1 && selectedCourseId && (
            <button
              onClick={() => setSelectedCourseId(null)}
              className="inline-flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-lavender-deep transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a mis cursos
            </button>
          )}

          {/* Expired purchases banner */}
          {expiredPurchases.length > 0 && (
            <div className="mb-8 space-y-3">
              {expiredPurchases.map((purchase: any) => (
                <div key={purchase.id} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-base font-medium text-amber-800 dark:text-amber-200">
                        Renovación pendiente — {purchase.products?.name || "Curso"}
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-body font-light mt-1">
                        Tu acceso mensual ha expirado. Adjunta el comprobante de pago para reactivar tu formación.
                      </p>
                      {hasPendingRenewal(purchase.product_id) ? (
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-body font-medium mt-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Renovación en revisión — te confirmaremos pronto
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            setRenewalProduct({
                              id: purchase.product_id,
                              name: purchase.products?.name || "Curso",
                              amount: 80,
                            });
                            setRenewalOpen(true);
                          }}
                          className="mt-3 px-6 py-2.5 bg-amber-600 text-white rounded-full font-body font-medium text-sm hover:bg-amber-700 transition-colors"
                        >
                          Adjuntar comprobante de renovación
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {(selectedCourseId || activePurchases.length <= 1) && (
          <>
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-body font-medium">Progreso general</span>
              <span className="text-sm font-body text-muted-foreground">
                {completedCount}/{lessons.length} completados
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Primer encuentro grupal — informativo (Curso Completo y Reiki Nivel I) */}
          {activePurchases.some((p: any) =>
            p.products?.slug === "curso-completo" ||
            p.products?.slug === "despertar-maestria" ||
            p.products?.slug === "reiki-nivel-1"
          ) && (
            <div className="mb-8 rounded-xl border border-lavender/40 bg-lavender/10 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lavender-deep/15 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-lavender-deep" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-medium text-lavender-deep">
                    Primer encuentro grupal
                  </h3>
                  <p className="text-sm text-muted-foreground font-body font-light mt-1">
                    Antes de comenzar con los contenidos te invitamos al primer encuentro en directo con Elisabet y el resto de alumnos. Es el punto de partida para conectar con el grupo y resolver tus primeras dudas.
                  </p>
                  <Link
                    to="/formacion/calendario"
                    className="inline-block mt-3 px-5 py-2 rounded-full font-body text-xs font-medium bg-lavender-deep text-cream hover:opacity-90 transition-opacity"
                  >
                    Ver próximos encuentros
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Lesson list */}
          {requiresFirstEncounter && !firstEncounterDone && (
            <div className="mb-8 rounded-xl border border-lavender/40 bg-lavender/10 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-lavender-deep/15 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-5 h-5 text-lavender-deep" />
              </div>
              <h3 className="font-heading text-xl font-medium text-lavender-deep mb-2">
                Contenidos disponibles tras el primer encuentro
              </h3>
              <p className="text-sm text-muted-foreground font-body font-light max-w-md mx-auto mb-4">
                Para mantener la coherencia del proceso, el acceso a los videos y materiales se abre después de tu primer encuentro grupal en directo con Elisabet.
              </p>
              <Link
                to="/formacion/calendario"
                className="inline-block px-6 py-2.5 rounded-full font-body text-sm font-medium bg-lavender-deep text-cream hover:opacity-90 transition-opacity"
              >
                Ver próximos encuentros
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {lessons.map((lesson: any, index: number) => {
              const completed = isCompleted(lesson.id);
              const unlocked = isUnlocked(index);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl border p-5 transition-all ${
                    completed
                      ? "bg-lavender/10 border-lavender/30"
                      : unlocked
                      ? "bg-background border-border/50 hover:border-lavender/40"
                      : "bg-muted/30 border-border/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      completed
                        ? "bg-lavender-deep text-cream"
                        : unlocked
                        ? "bg-earth-deep/10 text-earth-deep"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : unlocked ? (
                        <Play className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-body text-muted-foreground">
                          Lección {lesson.lesson_number}
                        </span>
                        {completed && (
                          <span className="text-xs font-body text-lavender-deep font-medium">
                            ✓ Completado
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-lg font-medium">{lesson.title}</h3>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground font-body font-light mt-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      {completed ? (
                        <span className="text-xs text-lavender-deep font-body">Revisitar →</span>
                      ) : unlocked ? (
                        <ChevronRight className="w-5 h-5 text-earth-deep" />
                      ) : null}
                    </div>
                  </div>

                  {/* Video player (only for unlocked lessons) */}
                  {unlocked && lesson.video_path && signedUrls[lesson.id] && (
                    <VideoLesson
                      lessonId={lesson.id}
                      src={signedUrls[lesson.id]}
                      completed={completed}
                      onComplete={() => markComplete.mutate(lesson.id)}
                    />
                  )}

                  {/* PDF material (only for unlocked lessons without a video) */}
                  {unlocked && !lesson.video_path && lesson.downloadable_path && pdfUrls[lesson.id] && (
                    <div className="mt-4 space-y-3">
                      <iframe
                        src={`${pdfUrls[lesson.id]}#toolbar=0&navpanes=0&scrollbar=1`}
                        title={lesson.title}
                        className="w-full h-[600px] rounded-lg border border-border/50 bg-muted"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={pdfUrls[lesson.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 rounded-full font-body text-xs font-medium bg-lavender-deep text-cream hover:opacity-90 transition-opacity"
                        >
                          Abrir en pestaña nueva
                        </a>
                        {!completed && (
                          <button
                            onClick={() => markComplete.mutate(lesson.id)}
                            className="px-5 py-2 rounded-full font-body text-xs font-medium bg-earth-deep text-cream hover:opacity-90 transition-opacity"
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* All completed — redirect to calendar */}
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 bg-gradient-to-r from-lavender/20 to-earth/10 rounded-2xl p-8 border border-lavender/30 text-center"
            >
              <Calendar className="w-10 h-10 text-lavender-deep mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-medium mb-2">¡Contenido completado!</h2>
              <p className="text-muted-foreground font-body font-light mb-6 max-w-md mx-auto">
                Has completado todos los videos. El siguiente paso es reservar tus sesiones presenciales.
              </p>
              <Link
                to="/formacion/calendario"
                className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Ver calendario de sesiones
              </Link>
            </motion.div>
          )}
          </>
          )}

          {/* Upcoming individual sessions */}
          <div className="mt-12">
            <UpcomingBookings />
          </div>

          {/* Group sessions */}
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-medium mb-6">Sesiones grupales</h2>
            <GroupSessionsList />
          </div>
        </motion.div>
      </div>

      {/* Renewal dialog */}
      {renewalProduct && (
        <RenewalPaymentDialog
          open={renewalOpen}
          onOpenChange={(open) => {
            setRenewalOpen(open);
            if (!open) {
              queryClient.invalidateQueries({ queryKey: ["pending-renewals"] });
            }
          }}
          productId={renewalProduct.id}
          productName={renewalProduct.name}
          amount={renewalProduct.amount}
        />
      )}
    </div>
  );
};

export default MiBiblioteca;
