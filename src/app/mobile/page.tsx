"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Car, LogOut, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { conectarEstado, type ConexaoStatus } from "@/lib/ws";
import { PRIORIDADES, type EstadoSnapshot } from "@/lib/types";

const STORAGE_KEY = "patio-bst:identidade";

function normalizar(valor: string): string {
  return valor.trim().toUpperCase();
}

export default function MobilePage() {
  const [snap, setSnap] = useState<EstadoSnapshot | null>(null);
  const [status, setStatus] = useState<ConexaoStatus>("conectando");
  const [identidade, setIdentidade] = useState<string | null>(null);
  const [entrada, setEntrada] = useState("");
  const [prioridade, setPrioridade] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    texto: string;
    tipo: "ok" | "info" | "erro";
  } | null>(null);

  // Restaura identidade salva (sobrevive a refresh / reabrir o QR).
  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) setIdentidade(salvo);
  }, []);

  // Conecta no mesmo WebSocket do painel.
  useEffect(() => {
    return conectarEstado(setSnap, setStatus);
  }, []);

  const minhaVaga = useMemo(() => {
    if (!identidade || !snap) return null;
    return snap.vagas.find((v) => v.ocupada && v.placaVeiculo === identidade) ?? null;
  }, [identidade, snap]);

  const minhaFila = useMemo(() => {
    if (!identidade || !snap) return null;
    return snap.fila.find((f) => f.placa === identidade) ?? null;
  }, [identidade, snap]);

  const handleEstacionar = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const id = normalizar(entrada);
      if (!id) return;
      setLoading(true);
      setFeedback(null);
      try {
        const resp = await api.entrada(id, prioridade);
        setIdentidade(id);
        localStorage.setItem(STORAGE_KEY, id);
        setEntrada("");
        setFeedback({
          texto: resp.mensagem,
          tipo: !resp.sucesso ? "erro" : resp.tipo === "FILA" ? "info" : "ok",
        });
        // Se deu erro (ex.: já estava no pátio) não fixa identidade nova inválida.
        if (!resp.sucesso) {
          localStorage.removeItem(STORAGE_KEY);
          setIdentidade(null);
        }
      } catch {
        setFeedback({ texto: "Falha ao conectar com o servidor.", tipo: "erro" });
      } finally {
        setLoading(false);
      }
    },
    [entrada, prioridade]
  );

  const handleSair = useCallback(async () => {
    if (!identidade) return;
    setLoading(true);
    try {
      const resp = await api.saida(identidade);
      setFeedback({
        texto: resp.sucesso ? "Vaga liberada. Até a próxima!" : resp.mensagem,
        tipo: resp.sucesso ? "ok" : "erro",
      });
      if (resp.sucesso) {
        localStorage.removeItem(STORAGE_KEY);
        setIdentidade(null);
      }
    } catch {
      setFeedback({ texto: "Falha ao conectar com o servidor.", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  }, [identidade]);

  function reiniciar() {
    localStorage.removeItem(STORAGE_KEY);
    setIdentidade(null);
    setFeedback(null);
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 py-8">
      <header className="flex items-center gap-3">
        <Image
          src="/logo-estacionamento.png"
          alt="Pátio BST"
          width={44}
          height={44}
          priority
          className="h-11 w-11 rounded-lg shadow-lift"
        />
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold tracking-tight text-ink-950">
            Pátio BST
          </h1>
          <div className="text-[12px] text-ink-500">Estacione pelo celular</div>
        </div>
        <StatusDot status={status} />
      </header>

      <div className="mt-8 flex-1">
        {minhaVaga ? (
          <EstacionadoCard
            vaga={minhaVaga.numero}
            identidade={identidade!}
            onSair={handleSair}
            loading={loading}
          />
        ) : minhaFila ? (
          <FilaCard
            posicao={minhaFila.posicao + 1}
            label={minhaFila.prioridadeLabel}
            total={snap?.fila.length ?? 0}
            identidade={identidade!}
            onCancelar={reiniciar}
          />
        ) : (
          <FormEntrada
            entrada={entrada}
            setEntrada={setEntrada}
            prioridade={prioridade}
            setPrioridade={setPrioridade}
            onSubmit={handleEstacionar}
            loading={loading}
            livres={snap?.stats?.vagasLivres ?? null}
            total={snap?.stats?.totalVagas ?? null}
          />
        )}

        {feedback && (
          <div
            className={[
              "mt-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
              feedback.tipo === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : feedback.tipo === "info"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-800",
            ].join(" ")}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{feedback.texto}</span>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-[11px] text-ink-400">
        BST + Min-Heap em Java · atualização em tempo real
      </footer>
    </main>
  );
}

function StatusDot({ status }: { status: ConexaoStatus }) {
  const map = {
    conectando: { cor: "bg-amber-400", txt: "conectando" },
    conectado: { cor: "bg-emerald-500", txt: "ao vivo" },
    desconectado: { cor: "bg-red-400", txt: "offline" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2.5 py-1 text-[11px] text-ink-600">
      <span className={`h-1.5 w-1.5 rounded-full ${s.cor}`} /> {s.txt}
    </span>
  );
}

function FormEntrada({
  entrada,
  setEntrada,
  prioridade,
  setPrioridade,
  onSubmit,
  loading,
  livres,
  total,
}: {
  entrada: string;
  setEntrada: (v: string) => void;
  prioridade: number;
  setPrioridade: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  livres: number | null;
  total: number | null;
}) {
  const lotado = livres === 0;
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 text-ink-950">
          <Car size={18} strokeWidth={1.75} />
          <span className="font-display text-base font-semibold">Estacionar</span>
        </div>

        {livres !== null && total !== null && (
          <p className="mt-1 text-[13px] text-ink-500">
            {lotado
              ? "Pátio lotado — você entrará na fila de prioridade."
              : `${livres} de ${total} vagas livres agora.`}
          </p>
        )}

        <label className="mb-1.5 mt-5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Placa ou nome
        </label>
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="ABC1D23 ou seu nome"
          maxLength={20}
          autoCapitalize="characters"
          className="w-full rounded border border-ink-200 bg-white px-3 py-3 text-base uppercase tracking-wide text-ink-950 outline-none transition-colors placeholder:text-ink-400 focus:border-ink-950"
        />

        <label className="mb-1.5 mt-5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Categoria
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRIORIDADES.map((p) => {
            const active = prioridade === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPrioridade(p.value)}
                className={[
                  "rounded border px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-ink-200 bg-white text-ink-700 active:border-ink-400",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !entrada.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink-950 px-4 py-4 text-base font-medium text-white transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-300"
      >
        {loading ? "Processando..." : "Estacionar"}
      </button>
    </form>
  );
}

function EstacionadoCard({
  vaga,
  identidade,
  onSair,
  loading,
}: {
  vaga: number;
  identidade: string;
  onSair: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center shadow-card">
        <CheckCircle2 size={40} className="mx-auto text-emerald-600" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-emerald-700">Você está estacionado</p>
        <div className="mt-1 font-display text-5xl font-bold tracking-tight text-emerald-900">
          Vaga {vaga}
        </div>
        <div className="mt-2 text-sm text-emerald-700">{identidade}</div>
      </div>

      <button
        onClick={onSair}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-4 text-base font-medium text-ink-900 transition-colors active:translate-y-px disabled:opacity-50"
      >
        <LogOut size={16} />
        {loading ? "Saindo..." : "Sair da vaga"}
      </button>
    </div>
  );
}

function FilaCard({
  posicao,
  label,
  total,
  identidade,
  onCancelar,
}: {
  posicao: number;
  label: string;
  total: number;
  identidade: string;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-card">
        <Clock size={40} className="mx-auto text-amber-600" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-amber-700">Pátio lotado — você está na fila</p>
        <div className="mt-1 font-display text-5xl font-bold tracking-tight text-amber-900">
          {posicao}º
        </div>
        <div className="mt-2 text-sm text-amber-700">
          {identidade} · prioridade {label} · {total} na fila
        </div>
        <p className="mt-3 text-[12px] text-amber-600">
          Assim que uma vaga abrir, você assume automaticamente. Esta tela atualiza
          sozinha.
        </p>
      </div>

      <button
        onClick={onCancelar}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-500 transition-colors active:translate-y-px"
      >
        Sair desta tela
      </button>
    </div>
  );
}
