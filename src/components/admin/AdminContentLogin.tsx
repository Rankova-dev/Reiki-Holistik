import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { clearAdminToken, contentApi, getAdminToken, setAdminToken } from "@/lib/contentApi";

const AdminContentLogin = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(getAdminToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token: newToken } = await contentApi.login(username, password);
      setAdminToken(newToken);
      setToken(newToken);
    } catch (err: any) {
      toast.error(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <form onSubmit={handleLogin} className="max-w-sm space-y-4">
        <p className="text-sm text-muted-foreground font-body">
          Este apartado usa un acceso independiente al resto del panel.
        </p>
        <div>
          <Label>Usuario</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearAdminToken();
            setToken(null);
          }}
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión de contenido
        </Button>
      </div>
      {children}
    </div>
  );
};

export default AdminContentLogin;
