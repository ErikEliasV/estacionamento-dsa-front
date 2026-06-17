"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { PLACAS_SUGERIDAS, PRIORIDADES } from "@/lib/types";

type Props = {
  onSubmit: (placa: string, prioridade: number) => Promise<void>;
  loading?: boolean;
};

export function EntradaForm({ onSubmit, loading }: Props) {
  const [placa, setPlaca] = useState("");
  const [prioridade, setPrioridade] = useState<number>(4);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) return;
    await onSubmit(placa.trim().toUpperCase(), prioridade);
    setPlaca("");
    setPrioridade(4);
  }

  function aplicar(p: { placa: string; prioridade: number }) {
    setPlaca(p.placa);
    setPrioridade(p.prioridade);
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Placa
        </label>
        <input
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          placeholder="ABC1D23"
          maxLength={8}
          className="w-full rounded border border-ink-200 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wider text-ink-950 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles size={11} strokeWidth={1.75} className="text-ink-500" />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
            Sugestões
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLACAS_SUGERIDAS.map((p) => (
            <button
              key={p.placa}
              type="button"
              onClick={() => aplicar(p)}
              className="group inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2 py-1 transition-colors hover:border-ink-950"
              title={p.hint}
            >
              <span className="font-mono text-[11px] font-medium text-ink-900">
                {p.placa}
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-ink-500 group-hover:text-ink-700">
                {p.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Prioridade
        </label>
        <div className="grid grid-cols-4 gap-1">
          {PRIORIDADES.map((p) => {
            const active = prioridade === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPrioridade(p.value)}
                className={[
                  "rounded border px-2 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
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
        disabled={loading || !placa.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-300"
      >
        {loading ? "Processando" : "Registrar entrada"}
        {!loading && <ArrowRight size={14} strokeWidth={2} />}
      </button>
    </form>
  );
}
