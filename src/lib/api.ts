import type {
  BstNode,
  EntradaResponse,
  FilaItem,
  SaidaResponse,
  Stats,
  Vaga,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/estacionamento${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao chamar ${path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  vagas: () => request<Vaga[]>("/vagas"),
  fila: () => request<FilaItem[]>("/fila"),
  stats: () => request<Stats>("/stats"),
  bstTree: () => request<BstNode>("/bst-tree"),
  entrada: (placa: string, prioridade: number) =>
    request<EntradaResponse>("/entrada", {
      method: "POST",
      body: JSON.stringify({ placa, prioridade }),
    }),
  saida: (placa: string) =>
    request<SaidaResponse>("/saida", {
      method: "POST",
      body: JSON.stringify({ placa }),
    }),
  reset: () =>
    request<{ sucesso: boolean; mensagem: string }>("/reset", {
      method: "POST",
    }),
  lotar: () =>
    request<{ sucesso: boolean; mensagem: string }>("/lotar", {
      method: "POST",
    }),
  configurar: (totalVagas: number) =>
    request<{ sucesso: boolean; mensagem: string; totalVagas: number }>(
      "/configurar",
      {
        method: "POST",
        body: JSON.stringify({ totalVagas }),
      }
    ),
};
