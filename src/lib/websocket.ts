type WSMessage<T = any> = { type: string; data: T; sender?: string };

interface RoomInfo {
  projectId: string;
  userId: string;
  username: string;
}

class WSClient {
  private ws?: WebSocket;
  private listeners = new Map<string, Set<(d: any) => void>>();
  private currentRoom?: RoomInfo;
  private id =
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  private _isConnected = false;
  private connectionPromise?: Promise<void>;

  async createRoom(userId: string, username: string): Promise<string> {
    if (typeof window === "undefined") return "";

    try {
      const projectId = this.generateProjectId();
      console.log('🚀 Creando nueva sala:', projectId);

      this.currentRoom = {
        projectId,
        userId,
        username,
      };

      // MODIFICACIÓN: Esperar a que la conexión se complete
      await this.connect(projectId, userId, username);

      this.emit('room:created', {
        projectId,
        creator: { userId, username }
      });

      console.log('✅ Sala creada con código:', projectId);
      return projectId;
    } catch (error) {
      console.error('❌ Error creando sala:', error);
      throw error;
    }
  }

  /* Conectar cuando el usuario entre a la sala  */
  connect(projectId: string, userId: string, username: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    console.log('🔌 Conectando WS')

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (!this.currentRoom) {
      this.currentRoom = {
        projectId,
        userId,
        username
      };
    }

    const params = new URLSearchParams({
      project_id: projectId,
      user_id: userId,
      username,
    });

    const url = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/connect?${params.toString()}`;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.info("🔌 WS connected");
        this._isConnected = true;
        this.connectionPromise = undefined; // Limpiar la promesa
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WS connection error:", error);
        this._isConnected = false;
        this.connectionPromise = undefined;
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("🔌 WS disconnected");
        this._isConnected = false;
        this.connectionPromise = undefined;
        setTimeout(
          () => this.connect(projectId, userId, username),
          1_000 /* reintento */
        );
      };

      this.ws.onmessage = (e) => {
        console.log("📨 WS message", e.data);
        const msg: WSMessage = JSON.parse(e.data);
        if (msg.sender === this.id) return; // ignora eco
        this.listeners.get(msg.type)?.forEach((cb) => cb(msg.data));
      };
    });

    return this.connectionPromise;
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

  leaveRoom() {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  get isConnected(): boolean {
    return this._isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  get currentProjectId(): string | undefined {
    return this.currentRoom?.projectId;
  }

  async joinRoom(projectId: string, userId: string, username: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      console.log('🔗 Intentando unirse a sala con código:', projectId);

      // Esperar a que la conexión se complete
      await this.connect(projectId, userId, username);

      this.emit('room:joined', {
        projectId,
        user: { userId, username }
      });

      console.log('✅ Unido a sala exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error uniéndose a sala:', error);
      throw error;
    }
  }

  private generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export const wsClient = new WSClient();

