import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UniverseProvider } from "@/hooks/useUniverse";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePageTracking } from "@/hooks/usePageTracking";
import Home from "@/pages/Home";
import SobreMi from "@/pages/SobreMi";
import Sesiones from "@/pages/Sesiones";
import Contacto from "@/pages/Contacto";
import FormacionHome from "@/pages/FormacionHome";
import Cursos from "@/pages/Cursos";
import CursoDetalle from "@/pages/CursoDetalle";
import Calendario from "@/pages/Calendario";
import MiBiblioteca from "@/pages/MiBiblioteca";
import Cuenta from "@/pages/Cuenta";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

const PageTracker = () => { usePageTracking(); return null; };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UniverseProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTracker />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sobre-mi" element={<SobreMi />} />
                <Route path="/sesiones" element={<Sesiones />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/formacion" element={<FormacionHome />} />
                <Route path="/formacion/cursos" element={<Cursos />} />
                <Route path="/formacion/curso/:id" element={<CursoDetalle />} />
                <Route path="/formacion/calendario" element={<Calendario />} />
                <Route path="/formacion/mi-biblioteca" element={<MiBiblioteca />} />
                <Route path="/cuenta" element={<ProtectedRoute><Cuenta /></ProtectedRoute>} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </UniverseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
