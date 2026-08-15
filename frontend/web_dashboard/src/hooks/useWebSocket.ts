import { useCallback, useEffect, useRef, useState } from 'react';

type MessageHandler<T> = (message: T) => void;

export function useWebSocket<T = unknown>(url?: string, onMessage?: MessageHandler<T>) {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!url) return;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setLastMessage(parsed);
        onMessageRef.current?.(parsed);
      } catch {
        // Ignore non-JSON WebSocket messages.
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [url]);

  const sendMessage = useCallback((message: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
