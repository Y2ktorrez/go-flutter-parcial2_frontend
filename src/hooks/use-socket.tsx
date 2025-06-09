import { wsClient } from "@/lib/websocket";
import { useEffect } from "react";

/* Helper hook (tiny) ------------------------------------------------------- */
export function useSocket<T = any>(type: string, handler: (d: T) => void) {
  useEffect(() => wsClient.on(type, handler), [type, handler]);
}

