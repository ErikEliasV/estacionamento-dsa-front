import type { BstNode, FilaItem } from "./types";

export type TraceStep = {
  kind: "info" | "visit" | "match" | "swap" | "result" | "error";
  text: string;
};

/**
 * Reproduce client-side the in-order search of `buscarPrimeiraVagaLivre`
 * to produce a traceable visit list (same algorithm as the backend).
 * Returns the path of visited nodes (in order) and the number of the first
 * free node found, or null.
 */
export function tracarBuscaPrimeiraVagaLivre(root: BstNode): {
  visited: number[];
  encontrada: number | null;
  steps: TraceStep[];
} {
  const visited: number[] = [];
  const steps: TraceStep[] = [];
  let encontrada: number | null = null;

  function walk(node: BstNode): boolean {
    if (!node) return false;
    if (walk(node.left)) return true;
    visited.push(node.numero);
    if (node.ocupada) {
      steps.push({
        kind: "visit",
        text: `Vaga ${node.numero} visitada. Ocupada por ${node.placaVeiculo}.`,
      });
      return walk(node.right);
    }
    steps.push({
      kind: "match",
      text: `Vaga ${node.numero} visitada. Livre. Selecionada.`,
    });
    encontrada = node.numero;
    return true;
  }

  steps.push({
    kind: "info",
    text: "Iniciando traversal in-order na BST (esquerda, raiz, direita).",
  });
  walk(root);
  if (encontrada === null) {
    steps.push({
      kind: "info",
      text: "Nenhuma vaga livre. Encaminhando para a fila (Min-Heap).",
    });
  }
  return { visited, encontrada, steps };
}

export type HeapNodeLite = {
  placa: string;
  prioridade: number;
  prioridadeLabel: string;
  chegada: number;
};

function cmp(a: HeapNodeLite, b: HeapNodeLite) {
  if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
  return a.chegada - b.chegada;
}

/**
 * Simulate heap insert and produce trace steps describing each heapify-up swap.
 * Returns the final heap state and the per-step swap pairs (for animation).
 */
export function simularInsercaoHeap(
  atual: FilaItem[],
  novo: { placa: string; prioridade: number; prioridadeLabel: string }
): { heapFinal: HeapNodeLite[]; steps: TraceStep[]; swaps: [number, number][] } {
  const heap: HeapNodeLite[] = atual.map((it, idx) => ({
    placa: it.placa,
    prioridade: it.prioridade,
    prioridadeLabel: it.prioridadeLabel,
    chegada: idx,
  }));
  const node: HeapNodeLite = { ...novo, chegada: heap.length + 1000 };
  heap.push(node);
  const steps: TraceStep[] = [];
  const swaps: [number, number][] = [];

  steps.push({
    kind: "info",
    text: `Inserindo ${novo.placa} (${novo.prioridadeLabel}) na posição ${heap.length - 1}.`,
  });

  let i = heap.length - 1;
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    if (cmp(heap[i], heap[p]) < 0) {
      steps.push({
        kind: "swap",
        text: `Heapify-up: pos ${i} (${heap[i].prioridadeLabel}) tem prioridade maior que pos ${p} (${heap[p].prioridadeLabel}). Troca.`,
      });
      [heap[i], heap[p]] = [heap[p], heap[i]];
      swaps.push([i, p]);
      i = p;
    } else {
      steps.push({
        kind: "info",
        text: `Pos ${i} cabe abaixo do pai pos ${p}. Heap estável.`,
      });
      break;
    }
  }
  if (i === 0 && swaps.length > 0) {
    steps.push({
      kind: "info",
      text: "Elemento subiu até a raiz do heap.",
    });
  }
  return { heapFinal: heap, steps, swaps };
}
