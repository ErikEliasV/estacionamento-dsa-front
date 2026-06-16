import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { EstadoSnapshot } from "./types";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080";

export type ConexaoStatus = "conectando" | "conectado" | "desconectado";

/**
 * Conecta no WebSocket (STOMP sobre SockJS) e assina /topic/estado.
 * Devolve uma função de cleanup que encerra a conexão.
 */
export function conectarEstado(
  onSnapshot: (estado: EstadoSnapshot) => void,
  onStatus?: (status: ConexaoStatus) => void
): () => void {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onStatus?.("conectado");
      client.subscribe("/topic/estado", (message: IMessage) => {
        try {
          onSnapshot(JSON.parse(message.body) as EstadoSnapshot);
        } catch (e) {
          console.error("Snapshot inválido recebido via WS", e);
        }
      });
    },
    onWebSocketClose: () => onStatus?.("desconectado"),
    onStompError: () => onStatus?.("desconectado"),
  });

  onStatus?.("conectando");
  client.activate();

  return () => {
    void client.deactivate();
  };
}
