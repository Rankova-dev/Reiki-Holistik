import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/34600000000"
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float"
    aria-label="Contactar por WhatsApp"
  >
    <MessageCircle className="w-7 h-7 text-primary-foreground" />
  </a>
);

export default WhatsAppButton;
