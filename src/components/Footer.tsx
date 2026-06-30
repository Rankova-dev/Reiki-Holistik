import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-earth-deep text-cream py-12 relative z-10">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Reiki Holistik" className="h-12 w-12 rounded-full object-cover" />
          <span className="font-heading text-2xl">Reiki <span className="text-lavender">Holistik</span></span>
        </div>
        <div className="flex gap-6 text-sm font-body text-cream/70">
          <Link to="/aviso-legal" className="hover:text-cream transition-colors">Aviso legal</Link>
          <Link to="/privacidad" className="hover:text-cream transition-colors">Política de privacidad</Link>
          <Link to="/cookies" className="hover:text-cream transition-colors">Cookies</Link>
        </div>
        <p className="text-sm text-cream/50 font-body">© {new Date().getFullYear()} Reiki Holistik</p>
      </div>
    </div>
  </footer>
);

export default Footer;
