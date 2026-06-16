"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Binary, Car, GitBranch, RotateCcw, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { conectarEstado } from "@/lib/ws";
import type { BstNode, FilaItem, Stats, Vaga } from "@/lib/types";
import { QrConvite } from "@/components/QrConvite";
import {
  simularInsercaoHeap,
  tracarBuscaPrimeiraVagaLivre,
  type TraceStep,
} from "@/lib/dsa";
import { StatsCards } from "@/components/StatsCards";
import { VagasGrid } from "@/components/VagasGrid";
import { FilaList } from "@/components/FilaList";
import { EntradaForm } from "@/components/EntradaForm";
import { SaidaForm } from "@/components/SaidaForm";
import { ToastStack, type ToastMessage } from "@/components/Toast";
import { ConfigurarVagas } from "@/components/ConfigurarVagas";
import { BstView } from "@/components/BstView";
import { HeapView } from "@/components/HeapView";
import { TracePanel } from "@/components/TracePanel";

type Snapshot = {
  vagas: Vaga[];
  fila: FilaItem[];
  stats: Stats | null;
  tree: BstNode;
};

export default function Page() {
  const [snap, setSnap] = useState<Snapshot>({
    vagas: [],
    fila: [],
    stats: null,
    tree: null,
  });
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [traceTitle, setTraceTitle] = useState<string>("Última operação");
  const [traceBigO, setTraceBigO] = useState<string | undefined>(undefined);
  const [visitedVagas, setVisitedVagas] = useState<number[]>([]);
  const [highlightVaga, setHighlightVaga] = useState<number | null>(null);
  const [highlightHeap, setHighlightHeap] = useState<number | null>(null);

  const pushToast = useCallback(
    (text: string, variant: ToastMessage["variant"] = "info") => {
      toastIdRef.current += 1;
      setToasts((prev) => [...prev, { id: toastIdRef.current, text, variant }]);
    },
    []
  );
  const dismiss = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const fetchAll = useCallback(async (): Promise<Snapshot> => {
    const [vagas, fila, stats, tree] = await Promise.all([
      api.vagas(),
      api.fila(),
      api.stats(),
      api.bstTree(),
    ]);
    return { vagas, fila, stats, tree };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchAll();
      setSnap(next);
      setConnected(true);
      return next;
    } catch (err) {
      console.error(err);
      setConnected(false);
      return null;
    }
  }, [fetchAll]);

  useEffect(() => {
    // Carga inicial via REST, depois atualizações em tempo real via WebSocket.
    refresh();
    const desconectar = conectarEstado(
      (estado) => {
        setSnap(estado);
        setConnected(true);
      },
      (status) => {
        if (status === "conectado") setConnected(true);
        else if (status === "desconectado") setConnected(false);
      }
    );
    return desconectar;
  }, [refresh]);

  function clearHighlights() {
    setVisitedVagas([]);
    setHighlightVaga(null);
    setHighlightHeap(null);
  }

  async function handleEntrada(placa: string, prioridade: number) {
    setLoading(true);
    clearHighlights();
    const treeAntes = snap.tree;
    const filaAntes = snap.fila;
    try {
      const resp = await api.entrada(placa, prioridade);
      pushToast(
        resp.mensagem,
        resp.sucesso ? (resp.tipo === "FILA" ? "info" : "success") : "error"
      );

      const next = await refresh();
      const steps: TraceStep[] = [];

      if (resp.tipo === "ESTACIONADO") {
        const t = tracarBuscaPrimeiraVagaLivre(treeAntes);
        steps.push(...t.steps);
        steps.push({
          kind: "result",
          text: `${resp.placa} ocupou a vaga ${resp.vagaNumero}.`,
        });
        setVisitedVagas(t.visited);
        setHighlightVaga(resp.vagaNumero);
        setTraceTitle("BST · busca da próxima vaga livre");
        setTraceBigO("O(log n) médio");
      } else if (resp.tipo === "FILA") {
        steps.push({
          kind: "info",
          text: "BST cheia. Operação delegada à Min-Heap.",
        });
        const sim = simularInsercaoHeap(filaAntes, {
          placa: resp.placa ?? placa,
          prioridade,
          prioridadeLabel: resp.prioridadeLabel ?? "",
        });
        steps.push(...sim.steps);
        if (next) {
          const idx = next.fila.findIndex((it) => it.placa === resp.placa);
          if (idx >= 0) setHighlightHeap(idx);
        }
        setTraceTitle("Min-Heap · inserção + heapify-up");
        setTraceBigO("O(log n)");
      } else {
        steps.push({ kind: "error", text: resp.mensagem });
        setTraceTitle("Erro");
        setTraceBigO(undefined);
      }

      setTrace(steps);
    } catch (e) {
      pushToast("Falha ao registrar entrada. Verifique o backend.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaida(placa: string) {
    setLoading(true);
    clearHighlights();
    const vagasAntes = snap.vagas;
    const filaAntes = snap.fila;
    try {
      const resp = await api.saida(placa);
      pushToast(resp.mensagem, resp.sucesso ? "success" : "error");
      await refresh();

      const steps: TraceStep[] = [];
      if (resp.sucesso) {
        steps.push({
          kind: "info",
          text: `Varredura linear (in-order) na BST procurando ${placa}.`,
        });
        const visited: number[] = [];
        for (const v of vagasAntes) {
          visited.push(v.numero);
          if (v.ocupada && v.placaVeiculo === placa) {
            steps.push({
              kind: "match",
              text: `Encontrado na vaga ${v.numero}. Liberando.`,
            });
            break;
          } else {
            steps.push({
              kind: "visit",
              text: `Vaga ${v.numero}: ${v.ocupada ? v.placaVeiculo : "livre"}.`,
            });
          }
        }
        setVisitedVagas(visited);
        setHighlightVaga(resp.vagaLiberada);

        if (resp.veiculoEntrante && filaAntes.length > 0) {
          steps.push({
            kind: "info",
            text: `Fila não vazia. extractMin remove a raiz (${resp.veiculoEntrante.placa}, ${resp.veiculoEntrante.prioridadeLabel}).`,
          });
          steps.push({
            kind: "swap",
            text: "Último elemento promovido à raiz, depois heapify-down até estabilizar.",
          });
          steps.push({
            kind: "result",
            text: `Vaga ${resp.veiculoEntrante.vagaOcupada} reocupada pela fila.`,
          });
          setTraceTitle("BST · saída + extractMin do heap");
          setTraceBigO("O(n) + O(log n)");
        } else {
          steps.push({
            kind: "result",
            text: `Vaga ${resp.vagaLiberada} liberada.`,
          });
          setTraceTitle("BST · saída de veículo");
          setTraceBigO("O(n)");
        }
      } else {
        steps.push({ kind: "error", text: resp.mensagem });
        setTraceTitle("Erro");
        setTraceBigO(undefined);
      }
      setTrace(steps);
    } catch (e) {
      pushToast("Falha ao registrar saída. Verifique o backend.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLotar() {
    setLoading(true);
    clearHighlights();
    try {
      await api.lotar();
      // Estado chega via WebSocket; só damos o feedback.
      pushToast("Todas as vagas foram ocupadas.", "info");
      setTrace([
        {
          kind: "info",
          text: "Todas as vagas livres foram ocupadas com veículos de demonstração.",
        },
        {
          kind: "result",
          text: "A partir de agora, novas entradas vão para a fila (Min-Heap).",
        },
      ]);
      setTraceTitle("Lotação forçada");
      setTraceBigO("O(n)");
    } catch {
      pushToast("Falha ao lotar as vagas.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (typeof window !== "undefined" && !window.confirm("Reiniciar estado do estacionamento?")) {
      return;
    }
    setLoading(true);
    clearHighlights();
    try {
      await api.reset();
      await refresh();
      setTrace([]);
      pushToast("Estado reiniciado.", "info");
    } catch {
      pushToast("Falha ao reiniciar.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfigurar(total: number) {
    setLoading(true);
    clearHighlights();
    try {
      const resp = await api.configurar(total);
      pushToast(resp.mensagem, "success");
      await refresh();
      setTrace([
        {
          kind: "info",
          text: `BST reconstruída com inserção balanceada para ${total} vagas.`,
        },
        {
          kind: "result",
          text: "Heap e estado das vagas zerados.",
        },
      ]);
      setTraceTitle("Reconfiguração");
      setTraceBigO("O(n)");
    } catch {
      pushToast("Falha ao configurar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
      <Header connected={connected} onReset={handleReset} onLotar={handleLotar} loading={loading} />

      <section className="mt-8">
        <StatsCards stats={snap.stats} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-4" title="Operações">
          <div className="space-y-6">
            <EntradaForm onSubmit={handleEntrada} loading={loading} />
            <hr className="border-ink-200" />
            <SaidaForm
              onSubmit={handleSaida}
              loading={loading}
              vagas={snap.vagas}
            />
          </div>
        </Panel>

        <Panel className="lg:col-span-8" title="Mapa do pátio">
          <VagasGrid
            vagas={snap.vagas}
            onSaida={handleSaida}
            highlightVaga={highlightVaga}
            visitedVagas={visitedVagas}
          />
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Panel
          className="lg:col-span-8"
          title="Árvore binária de busca"
          icon={GitBranch}
        >
          <BstView
            tree={snap.tree}
            visited={visitedVagas}
            highlight={highlightVaga}
          />
          <Legenda
            items={[
              { label: "Livre", swatch: "#ffffff", border: "#d4d4d4" },
              { label: "Ocupada", swatch: "#f5f5f5", border: "#737373" },
              { label: "Visitada", swatch: "#fef3c7", border: "#f59e0b" },
              { label: "Encontrada", swatch: "#0a0a0a", border: "#0a0a0a" },
            ]}
          />
        </Panel>

        <Panel className="lg:col-span-4" title="Trace de execução">
          <TracePanel title={traceTitle} bigO={traceBigO} steps={trace} />
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Panel
          className="lg:col-span-7"
          title="Min-Heap de prioridade"
          icon={Binary}
        >
          <HeapView fila={snap.fila} highlightIndex={highlightHeap} />
        </Panel>

        <div className="space-y-6 lg:col-span-5">
          <Panel title="Fila de espera">
            <FilaList fila={snap.fila} />
          </Panel>
          <Panel title="Configuração do pátio">
            <ConfigurarVagas
              current={snap.stats?.totalVagas ?? 0}
              onSubmit={handleConfigurar}
              loading={loading}
            />
          </Panel>
        </div>
      </section>

      <footer className="mt-10 border-t border-ink-200 pt-5 text-xs text-ink-500">
        <span>
          BST e Min-Heap implementados do zero em Java, com frontend Next.js.
        </span>
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}

function Header({
  connected,
  onReset,
  onLotar,
  loading,
}: {
  connected: boolean | null;
  onReset: () => void;
  onLotar: () => void;
  loading: boolean;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-asphalt-900 shadow-lift">
          <span className="font-display text-lg font-bold text-asphalt-line">
            P
          </span>
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-950">
            Pátio BST
          </h1>
          <div className="text-[13px] text-ink-500">
            Estacionamento com árvore binária e fila de prioridade
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <QrConvite />
        <ConnectionBadge connected={connected} />
        <button
          onClick={onLotar}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-400 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Car size={12} strokeWidth={1.75} />
          Lotar vagas
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-400 active:translate-y-px"
        >
          <RotateCcw size={12} strokeWidth={1.75} />
          Reiniciar
        </button>
      </div>
    </header>
  );
}

function ConnectionBadge({ connected }: { connected: boolean | null }) {
  if (connected === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-600">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-300" /> conectando
      </span>
    );
  }
  return connected ? (
    <span className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2.5 py-1 text-xs text-ink-700">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-950" /> API ativa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded border border-ink-300 bg-ink-50 px-2.5 py-1 text-xs text-ink-700">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-700" /> API offline
    </span>
  );
}

function Panel({
  title,
  eyebrow,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  eyebrow?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-lg border border-ink-200 bg-white p-5 shadow-card ${className}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          {eyebrow && (
            <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
              {eyebrow}
            </div>
          )}
          <h2 className="font-display text-[15px] font-semibold tracking-tight text-ink-950">
            {title}
          </h2>
        </div>
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="mt-0.5 text-ink-400"
          />
        )}
      </div>
      {children}
    </section>
  );
}

function Legenda({
  items,
}: {
  items: { label: string; swatch: string; border: string }[];
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-200 pt-3 text-[11px] text-ink-600">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: it.swatch, border: `1px solid ${it.border}` }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
