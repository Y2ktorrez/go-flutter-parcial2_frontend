// Tipos de mensajes WebSocket
export interface WebSocketMessage {
  type: 'connect' | 'disconnect' | 'cursor_update' | 'component_moved' | 'user_connected' | 'user_disconnected';
  userId: string;
  username?: string;
  color?: string;
  x?: number;
  y?: number;
  componentId?: string;
  position?: { x: number; y: number };
  screenId?: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // 1 segundo inicial
  private messageQueue: WebSocketMessage[] = [];

  constructor(
    private url: string,
    private onMessage: (data: WebSocketMessage) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('🌐 WebSocket conectado');
        this.onConnectionChange(true);
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
        
        // Enviar mensajes en cola
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) this.send(message);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('❌ Error al procesar mensaje:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.onConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error de WebSocket:', error);
      };
    } catch (error) {
      console.error('❌ Error al conectar WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      
      setTimeout(() => {
        this.connect();
        this.reconnectTimeout *= 2; // Backoff exponencial
      }, this.reconnectTimeout);
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Guardar mensaje en cola si no está conectado
      this.messageQueue.push(message);
      if (this.ws?.readyState !== WebSocket.CONNECTING) {
        this.connect();
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
