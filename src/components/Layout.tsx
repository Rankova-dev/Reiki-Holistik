import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AmbientBackground from "./AmbientBackground";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col relative">
    <AmbientBackground />
    <Navbar />
    <main className="flex-1 relative z-10 pt-16">{children}</main>
    <Footer />
  </div>
);

export default Layout;
