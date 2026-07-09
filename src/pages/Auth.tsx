import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { api, setAccountToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { preloadSocialAuthScripts, signInWithApple, signInWithGoogle } from "@/lib/socialAuth";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refresh } = useAuth();

  useEffect(() => {
    preloadSocialAuthScripts();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        toast({
          title: "Aún no disponible",
          description: "El restablecimiento de contraseña por email todavía no está activado. Contáctanos por WhatsApp y te ayudamos a recuperar el acceso.",
        });
        setMode("login");
      } else if (mode === "register") {
        const { token } = await api.register(email, password, name);
        setAccountToken(token);
        await refresh();
        navigate("/cuenta");
      } else {
        const { token } = await api.login(email, password);
        setAccountToken(token);
        await refresh();
        navigate("/cuenta");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithApple();
      await refresh();
      navigate("/cuenta");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 px-6">
      <div className="container mx-auto max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-heading text-3xl md:text-4xl font-light italic text-lavender-deep mb-2 text-center">
            {mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "Recuperar contraseña"}
          </h1>
          <p className="text-center text-muted-foreground font-body font-light mb-10">
            {mode === "login" ? "Accede a tu espacio personal" : mode === "register" ? "Únete a Reiki Holistik" : "Te enviaremos un enlace para restablecer tu contraseña"}
          </p>

          {/* Social buttons */}
          {mode !== "forgot" && (
            <div className="space-y-3 mb-8">
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-background border border-border/50 rounded-full font-body text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground font-body">o con email</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-full bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 rounded-full bg-background border border-border/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-accent-foreground font-body hover:underline block ml-4"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-earth-deep text-cream rounded-full font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "Enviar enlace"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-muted-foreground font-body mt-8">
            {mode === "login" ? (
              <>¿No tienes cuenta?{" "}<button onClick={() => setMode("register")} className="text-accent-foreground hover:underline">Crear cuenta</button></>
            ) : (
              <>¿Ya tienes cuenta?{" "}<button onClick={() => setMode("login")} className="text-accent-foreground hover:underline">Iniciar sesión</button></>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
