import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy, Upload, CheckCircle, Loader2, LogIn } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SETTINGS_DEFAULT } from "@/lib/contentDefaults";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  pricingOption: string;
  amount: number;
}

const PaymentDialog = ({ open, onOpenChange, productId, productName, pricingOption, amount }: PaymentDialogProps) => {
  const { user } = useAuth();
  const { content: settings } = useSiteContent("settings", SETTINGS_DEFAULT);
  const IBAN = settings.iban;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (!user || !open) return;
    setContactEmail(user.email || "");
    supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) setPhone(data.phone);
      });
  }, [user, open]);

  const copyIban = () => {
    navigator.clipboard.writeText(IBAN);
    toast.success("IBAN copiado al portapapeles");
  };

  const handleSubmit = async () => {
    if (!user || !file) return;
    if (!phone.trim() || !contactEmail.trim()) {
      toast.error("Completa tu teléfono y correo de contacto");
      return;
    }
    setUploading(true);

    try {
      // Upload proof image
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file);

      if (uploadError) throw uploadError;

      // Save phone to profile for future contact
      await supabase
        .from("profiles")
        .update({ phone: phone.trim() })
        .eq("id", user.id);

      // Create payment request
      const { error } = await supabase.from("payment_requests").insert({
        user_id: user.id,
        product_id: productId,
        pricing_option: pricingOption,
        amount,
        proof_url: path,
        admin_notes: `Contacto: ${contactEmail.trim()} · Tel: ${phone.trim()}`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("¡Solicitud enviada! Te confirmaremos el acceso pronto.");
    } catch (err: any) {
      toast.error("Error al enviar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSubmitted(false);
    setPhone("");
    setContactEmail("");
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-medium mb-2">¡Solicitud recibida!</h3>
            <p className="text-sm text-muted-foreground font-body font-light">
              Hemos recibido tu justificante. Revisaremos la transferencia y activaremos tu acceso lo antes posible.
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
          <DialogTitle className="font-heading text-xl">Pago por transferencia</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Realiza una transferencia bancaria y adjunta el justificante.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="text-center py-6">
            <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium mb-2">Inicia sesión para continuar</h3>
            <p className="text-sm text-muted-foreground font-body font-light mb-6">
              Necesitas una cuenta para enviar tu justificante y acceder a la formación.
            </p>
            <Link
              to="/auth"
              onClick={() => handleClose()}
              className="inline-block px-8 py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Iniciar sesión / Crear cuenta
            </Link>
          </div>
        ) : (
        <div className="space-y-5">
          {/* Product info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-body font-medium">{productName}</p>
            <p className="text-xs text-muted-foreground font-body">{pricingOption}</p>
            <p className="font-heading text-2xl font-medium text-earth-deep mt-1">{amount}€</p>
          </div>

          {/* IBAN */}
          <div>
            <p className="text-xs font-body font-medium text-muted-foreground mb-2">IBAN para la transferencia:</p>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3">
              <code className="flex-1 text-sm font-mono tracking-wider">{IBAN}</code>
              <button
                onClick={copyIban}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Copiar IBAN"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-2">
              Concepto: <span className="font-medium">{productName} — {user.email}</span>
            </p>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1.5 block">
                Correo de contacto *
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-body"
              />
            </div>
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground mb-1.5 block">
                Teléfono *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-body"
              />
            </div>
          </div>

          {/* File upload */}
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
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full py-3.5 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Enviar justificante"
            )}
          </button>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
