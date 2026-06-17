"use client";

import { Car, Layers, ParkingSquare, Timer } from "lucide-react";
import type { Stats } from "@/lib/types";

type Props = { stats: Stats | null };

export function StatsCards({ stats }: Props) {
  const items = [
    {
      label: "Vagas",
      value: stats?.totalVagas ?? "-",
      hint: "Nós na BST",
      icon: ParkingSquare,
    },
    {
      label: "Ocupadas",
      value: stats?.vagasOcupadas ?? "-",
      hint:
        stats !== null
          ? `${stats.taxaOcupacao.toFixed(1).replace(".", ",")}% de ocupação`
          : "",
      icon: Car,
    },
    {
      label: "Livres",
      value: stats?.vagasLivres ?? "-",
      hint: "Disponíveis agora",
      icon: Layers,
      accent: true,
    },
    {
      label: "Na fila",
      value: stats?.filaEspera ?? "-",
      hint: "Aguardando vaga",
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-200 bg-ink-200 sm:grid-cols-4">
      {items.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white p-5 transition-colors hover:bg-ink-50"
          >
            <div className={`flex items-center gap-2 ${c.accent ? "text-brand-600" : "text-ink-500"}`}>
              <Icon size={14} strokeWidth={1.75} />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
                {c.label}
              </span>
            </div>
            <div className={`mt-3 font-display text-3xl font-bold tabular-nums ${c.accent ? "text-brand-600" : "text-ink-950"}`}>
              {c.value}
            </div>
            <div className="mt-1 text-xs text-ink-500">{c.hint}</div>
          </div>
        );
      })}
    </div>
  );
}
