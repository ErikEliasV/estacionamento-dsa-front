"use client";

import type { FilaItem } from "@/lib/types";

type Props = { fila: FilaItem[] };

const ACCENT: Record<string, string> = {
  PCD: "before:bg-ink-900",
  Idoso: "before:bg-ink-700",
  Gestante: "before:bg-ink-500",
  Comum: "before:bg-ink-300",
};

function fmtHora(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

export function FilaList({ fila }: Props) {
  if (fila.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 p-6 text-center text-sm text-ink-500">
        Nenhum veículo aguardando.
      </div>
    );
  }

  return (
    <ul className="scrollbar-thin max-h-[360px] divide-y divide-ink-200 overflow-y-auto">
      {fila.map((item) => {
        const accent = ACCENT[item.prioridadeLabel] ?? ACCENT.Comum;
        return (
          <li
            key={`${item.placa}-${item.posicao}`}
            className={`relative flex items-center gap-3 py-3 pl-4 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-0.5 before:-translate-y-1/2 ${accent}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-xs font-medium tabular-nums text-ink-700">
              {item.posicao}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-medium text-ink-950">
                  {item.placa}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500">
                  {item.prioridadeLabel}
                </span>
              </div>
              <div className="text-xs text-ink-500">
                chegou às {fmtHora(item.horarioChegada)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
