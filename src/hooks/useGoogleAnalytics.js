import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function"&& window.location.hostname !== "localhost") {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);
}

