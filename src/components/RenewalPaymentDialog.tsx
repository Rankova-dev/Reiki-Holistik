import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy, Upload, CheckCircle, Loader2, CalendarClock } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SETTINGS_DEFAULT } from "@/lib/contentDefaults";

interface RenewalPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  amount: number;
}

const RenewalPaymentDialog = ({ open, onOpenChange, productId, productName, amount }: RenewalPaymentDialogProps) => {
  const { user } = useAuth();
  const { content: settings } = useSiteContent("settings", SETTINGS_DEFAULT);
  const IBAN = settings.iban;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copyIban = () => {
    navigator.clipboard.writeText(IBAN);
    toast.success("IBAN copiado al portapapeles");
  };

  const handleSubmit = async () => {
    if (!user || !file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error } = await supabase.from("payment_requests").insert({
        user_id: user.id,
        product_id: productId,
        pricing_option: "Mensual — Renovación",
        amount,
        proof_url: path,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("¡Renovación enviada! Te confirmaremos el acceso pronto.");
    } catch (err: any) {
      toast.error("Error al enviar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSubmitted(false);
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-medium mb-2">¡Renovación recibida!</h3>
            <p className="text-sm text-muted-foreground font-body font-light">
              Hemos recibido tu justificante de renovación mensual. Revisaremos la transferencia y reactivaremos tu acceso lo antes posible.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-500" />
            Renovación mensual
          </DialogTitle>
          <DialogDescription className="font-body text-sm">
            Tu acceso mensual ha expirado. Realiza la transferencia y adjunta el justificante para reactivar tu formación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-body font-medium text-amber-800 dark:text-amber-200">{productName}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-body">Pago mensual</p>
            <p className="font-heading text-2xl font-medium text-amber-700 dark:text-amber-300 mt-1">{amount}€</p>
          </div>

          <div>
            <p className="text-xs font-body font-medium text-muted-foreground mb-2">IBAN para la transferencia:</p>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3">
              <code className="flex-1 text-sm font-mono tracking-wider">{IBAN}</code>
              <button onClick={copyIban} className="p-2 hover:bg-muted rounded-md transition-colors" title="Copiar IBAN">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-2">
              Concepto: <span className="font-medium">Renovación {productName} — {user?.email}</span>
            </p>
          </div>

          <div>
            <p className="text-xs font-body font-medium text-muted-foreground mb-2">Adjunta el justificante:</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-lavender/50 transition-colors">
              {file ? (
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-body font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground font-body">Haz clic para cambiar</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-body">Haz clic o arrastra tu captura aquí</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">PNG, JPG o PDF</p>
                </>
              )}
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              "Enviar justificante de renovación"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RenewalPaymentDialog;
