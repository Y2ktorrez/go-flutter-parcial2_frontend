import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { WebSocketClient, WebSocketMessage } from '@/lib/websocket';

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  username: string;
  color: string;
}

export interface RealtimeState {
  cursors: Map<string, CursorPosition>;
  connectedUsers: Set<string>;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
];

export function useRealtime(projectId: string) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const userColorRef = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);

  useEffect(() => {
    if (!user || !projectId) return;

    const url = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/connect` +
    `?project_id=${projectId}` +
    `&user_id=${user.id}` +
    `&username=${encodeURIComponent(user.name)}`;

    // Crear instancia de WebSocketClient
    const wsClient = new WebSocketClient(url, handleWebSocketMessage, setIsConnected);

    wsClientRef.current = wsClient;
    wsClient.connect();

    // Enviar mensaje de conexión inicial
    wsClient.send({
      type: 'connect',
      userId: String(user.id),
      username: user.name || 'Anonymous',
      color: userColorRef.current
    });

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.send({
          type: 'disconnect',
          userId: String(user.id)
        });
        wsClientRef.current.disconnect();
      }
    };
  }, [user]);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'cursor_update':
        if (message.userId && message.x !== undefined && message.y !== undefined) {
          setCursors(prev => {
            const next = new Map(prev);
            next.set(message.userId!, {
              x: message.x!,
              y: message.y!,
              userId: message.userId!,
              username: message.username || 'Anonymous',
              color: message.color || '#FF0000'
            });
            return next;
          });
        }
        break;

      case 'user_connected':
        if (message.userId) {
          setConnectedUsers(prev => new Set([...prev, message.userId!]));
        }
        break;

      case 'user_disconnected':
        if (message.userId) {
          setConnectedUsers(prev => {
            const next = new Set(prev);
            next.delete(message.userId!);
            return next;
          });
          setCursors(prev => {
            const next = new Map(prev);
            next.delete(message.userId!);
            return next;
          });
        }
        break;

      case 'component_moved':
        if (message.componentId && message.position && message.userId !== String(user?.id)) {
          window.dispatchEvent(new CustomEvent('remote-component-move', {
            detail: {
              componentId: message.componentId,
              position: message.position,
              userId: message.userId
            }
          }));
        }
        break;
    }
  };

  const updateCursorPosition = (x: number, y: number) => {
    if (!wsClientRef.current || !user) return;

    wsClientRef.current.send({
      type: 'cursor_update',
      userId: String(user.id),
      username: user.name || 'Anonymous',
      color: userColorRef.current,
      x,
      y
    });
  };

  const sendComponentMovement = (componentId: string, position: { x: number; y: number }) => {
    if (!wsClientRef.current || !user) return;

    wsClientRef.current.send({
      type: 'component_moved',
      userId: String(user.id),
      componentId,
      position
    });
  };

  return {
    isConnected,
    cursors,
    connectedUsers,
    updateCursorPosition,
    sendComponentMovement,
    userColor: userColorRef.current
  };
}
