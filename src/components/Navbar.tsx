import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUniverse } from "@/hooks/useUniverse";
import { useAuth } from "@/hooks/useAuth";
import { User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";

const Navbar = () => {
  const { universe, setUniverse } = useUniverse();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/formacion") || location.pathname === "/cuenta") {
      setUniverse("formacion");
    } else {
      setUniverse("web");
    }
  }, [location.pathname, setUniverse]);

  const switchUniverse = (u: "web" | "formacion") => {
    setUniverse(u);
    navigate(u === "web" ? "/" : "/formacion");
    setMobileOpen(false);
  };

  const webLinks = [
    { to: "/sobre-mi", label: "Sobre mí" },
    { to: "/sesiones", label: "Sesiones" },
    { to: "/contacto", label: "Contacto" },
  ];

  const ADMIN_EMAILS = ["betyriudols@gmail.com", "albert.diaz@alumni.mondragon.edu"];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const formacionLinks = [
    { to: "/formacion", label: "Cursos" },
    { to: "/formacion/mi-biblioteca", label: "Mi Biblioteca" },
    { to: "/formacion/calendario", label: "Calendario" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const links = universe === "web" ? webLinks : formacionLinks;

  const handleUserIconClick = () => {
    if (user) {
      navigate("/cuenta");
    } else {
      navigate("/auth");
    }
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setUniverse("web")}>
          <img src={logoImg} alt="Reiki Holistik" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-heading text-xl md:text-2xl font-semibold tracking-wide">Reiki <span className="text-lavender-deep">Holistik</span></span>
        </Link>

        {/* Universe Toggle - center */}
        <div className="hidden md:flex items-center bg-muted rounded-full p-1 gap-0">
          <button
            onClick={() => switchUniverse("web")}
            className={`px-5 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
              universe === "web" ? "bg-earth-deep text-cream" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Web
          </button>
          <button
            onClick={() => switchUniverse("formacion")}
            className={`px-5 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-300 ${
              universe === "formacion" ? "bg-earth-deep text-cream" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Formación
          </button>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-body transition-colors ${
                location.pathname === link.to ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleUserIconClick}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border pb-4 px-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 py-3">
            <button
              onClick={() => switchUniverse("web")}
              className={`px-5 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                universe === "web" ? "bg-earth-deep text-cream" : "text-muted-foreground"
              }`}
            >
              Web
            </button>
            <button
              onClick={() => switchUniverse("formacion")}
              className={`px-5 py-1.5 rounded-full text-sm font-body font-medium transition-all ${
                universe === "formacion" ? "bg-earth-deep text-cream" : "text-muted-foreground"
              }`}
            >
              Formación
            </button>
          </div>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleUserIconClick}
            className="mt-2 w-full py-2.5 rounded-lg bg-muted text-sm font-body font-medium text-foreground"
          >
            {user ? "Mi cuenta" : "Iniciar sesión"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
