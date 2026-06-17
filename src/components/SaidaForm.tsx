"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import type { Vaga } from "@/lib/types";

type Props = {
  onSubmit: (placa: string) => Promise<void>;
  loading?: boolean;
  vagas?: Vaga[];
};

export function SaidaForm({ onSubmit, loading, vagas = [] }: Props) {
  const [placa, setPlaca] = useState("");

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) return;
    await onSubmit(placa.trim().toUpperCase());
    setPlaca("");
  }

  const ocupadas = vagas.filter((v) => v.ocupada && v.placaVeiculo);

  return (
    <form onSubmit={handle} className="space-y-3">
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

      {ocupadas.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
            Estacionadas agora
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ocupadas.slice(0, 8).map((v) => (
              <button
                key={v.numero}
                type="button"
                onClick={() => setPlaca(v.placaVeiculo!)}
                className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2 py-1 font-mono text-[11px] font-medium text-ink-900 transition-colors hover:border-ink-950"
              >
                {v.placaVeiculo}
                <span className="text-[9px] uppercase tracking-[0.14em] text-ink-500">
                  vaga {v.numero}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !placa.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded border border-ink-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-950 hover:bg-ink-50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processando" : "Registrar saída"}
        {!loading && <LogOut size={14} strokeWidth={2} />}
      </button>
    </form>
  );
}
