import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  const key = "rh_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();
    supabase.from("page_views").insert({
      path: location.pathname,
      session_id: sessionId,
    });
  }, [location.pathname]);
};
