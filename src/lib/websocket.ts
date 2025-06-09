/* Mensaje genérico: { type, data, sender } */
type WSMessage<T = any> = { type: string; data: T; sender?: string };

class WSClient {
  private ws?: WebSocket;
  private listeners = new Map<string, Set<(d: any) => void>>();
  private id =
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  /* Conectar cuando el usuario entre a la sala  */
  connect(projectId: string, userId: string, username: string) {
    if (typeof window === "undefined") return; // evita SSR
    console.log('🔌 Conectando WS')

    const params = new URLSearchParams({
      project_id: projectId,
      user_id: userId,
      username,
    });

    const url = `ws://localhost:8080/ws/connect?${params.toString()}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => console.info("🔌 WS connected");
    this.ws.onclose = () =>
      setTimeout(
        () => this.connect(projectId, userId, username),
        1_000 /* reintento */
      );

    this.ws.onmessage = (e) => {
      console.log("📨 WS message", e.data); 
      const msg: WSMessage = JSON.parse(e.data);
      if (msg.sender === this.id) return; // ignora eco
      this.listeners.get(msg.type)?.forEach((cb) => cb(msg.data));
    };
  }

  emit<T = any>(type: string, data: T) {
    const payload: WSMessage = { type, data, sender: this.id };
    this.ws?.readyState === WebSocket.OPEN &&
      this.ws.send(JSON.stringify(payload));
  }

  on<T = any>(type: string, cb: (d: T) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    const set = this.listeners.get(type)!;
    set.add(cb);
    return () => {
      set.delete(cb); // unsubscribe
    };
  }
}

export const wsClient = new WSClient();

