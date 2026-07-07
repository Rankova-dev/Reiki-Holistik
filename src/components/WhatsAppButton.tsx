import { MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SETTINGS_DEFAULT } from "@/lib/contentDefaults";

const WhatsAppButton = () => {
  const { content: settings } = useSiteContent("settings", SETTINGS_DEFAULT);

  return (
    <a
      href={`https://wa.me/${settings.whatsapp_number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label={settings.whatsapp_cta_label}
    >
      <MessageCircle className="w-7 h-7 text-primary-foreground" />
    </a>
  );
};

export default WhatsAppButton;
