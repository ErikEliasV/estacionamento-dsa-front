"use client";

import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";

type Props = {
  current: number;
  onSubmit: (totalVagas: number) => Promise<void>;
  loading?: boolean;
};

const PRESETS = [4, 8, 10, 16, 24, 32];

export function ConfigurarVagas({ current, onSubmit, loading }: Props) {
  const [n, setN] = useState<number>(current || 10);

  useEffect(() => {
    if (current) setN(current);
  }, [current]);

  async function apply(value: number) {
    if (value < 1 || value > 64) return;
    await onSubmit(value);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-ink-500">
        <Settings2 size={13} strokeWidth={1.75} />
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
          Quantidade de vagas
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((v) => {
          const active = v === current;
          return (
            <button
              key={v}
              type="button"
              onClick={() => apply(v)}
              disabled={loading}
              className={[
                "rounded border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors disabled:opacity-50",
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
              ].join(" ")}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={1}
          max={32}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="flex-1 accent-brand-600"
        />
        <span className="w-10 text-right text-sm font-medium tabular-nums text-ink-900">
          {n}
        </span>
        <button
          type="button"
          onClick={() => apply(n)}
          disabled={loading || n === current}
          className="rounded border border-ink-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-900 transition-colors hover:border-ink-950 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Aplicar
        </button>
      </div>

      <p className="text-xs leading-relaxed text-ink-500">
        Reconfigurar reconstrói a BST com inserção balanceada (raiz no meio,
        recursivamente nos halves). A fila e o estado são zerados.
      </p>
    </div>
  );
}
