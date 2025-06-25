import { useEffect } from "react";

export function useSSERefresh() {
  useEffect(() => {
    const es = new EventSource("/api/sse");
    es.addEventListener("update", () => {
      window.location.reload();
    });
    return () => es.close();
  }, []);
} 