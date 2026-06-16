"use client";

import { LogOut } from "lucide-react";
import type { Vaga } from "@/lib/types";

type Props = {
  vagas: Vaga[];
  onSaida?: (placa: string) => void;
  highlightVaga?: number | null;
  visitedVagas?: number[];
};

// Conjunto de cores padrão de carro. Cada veículo recebe uma delas.
const CAR_COLORS = [
  "#eef0f2", // branco
  "#c4c9cf", // prata
  "#6b7280", // cinza
  "#23262b", // preto
  "#c0392b", // vermelho
  "#2563eb", // azul
  "#15803d", // verde
  "#ea580c", // laranja
  "#1e3a5f", // azul-noite
  "#7c3aed", // roxo
];

type CarVariant = "sedan" | "conversivel" | "suv" | "picape";
const CAR_VARIANTS: CarVariant[] = ["sedan", "conversivel", "suv", "picape"];

function hashPlaca(placa: string): number {
  let h = 0;
  for (let i = 0; i < placa.length; i++) {
    h = (h * 31 + placa.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Cor e tipo "aleatórios" porém estáveis: derivados da placa, então não
// mudam a cada refresh, mas variam bastante entre veículos diferentes.
// Usamos partes diferentes do hash para tipo e cor variarem independente.
function corDoCarro(placa: string): string {
  return CAR_COLORS[hashPlaca(placa) % CAR_COLORS.length];
}

function variantDoCarro(placa: string): CarVariant {
  const h = hashPlaca(placa);
  return CAR_VARIANTS[Math.floor(h / 7) % CAR_VARIANTS.length];
}

export function VagasGrid({ vagas, onSaida, highlightVaga, visitedVagas }: Props) {
  if (vagas.length === 0) {
    return (
      <div className="asphalt-surface rounded-xl border border-asphalt-700 p-10 text-center">
        <div className="text-sm text-ink-300">Pátio sem vagas configuradas.</div>
        <div className="mt-1 text-xs text-ink-500">
          Defina um tamanho na configuração para pintar as vagas.
        </div>
      </div>
    );
  }

  const visited = new Set(visitedVagas ?? []);
  const ocupadas = vagas.filter((v) => v.ocupada).length;

  return (
    <div className="asphalt-surface overflow-hidden rounded-xl border border-asphalt-700 shadow-lift">
      {/* faixa de entrada do pátio */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-asphalt-line">
          <ParkingMark />
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em]">
            Vista superior
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-ink-400">
          {ocupadas}/{vagas.length} ocupadas
        </span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {vagas.map((v, i) => {
            const occupied = v.ocupada;
            const isVisited = visited.has(v.numero) && v.numero !== highlightVaga;
            const isHit = v.numero === highlightVaga;
            return (
              <div
                key={v.numero}
                className={[
                  "group relative aspect-[3/4] rounded-md transition-colors",
                  isHit
                    ? "ring-2 ring-accent-400 ring-offset-2 ring-offset-asphalt-900"
                    : "",
                  isVisited ? "bg-accent-400/10" : "",
                ].join(" ")}
              >
                {/* marcações pintadas da vaga */}
                <BayMarkings highlight={isHit} numero={v.numero} />

                {/* carro estacionado, centralizado dentro da vaga */}
                {occupied && v.placaVeiculo && (
                  <div className="absolute inset-x-0 bottom-[12%] top-[20%] z-10 flex justify-center">
                    <Car
                      color={corDoCarro(v.placaVeiculo)}
                      variant={variantDoCarro(v.placaVeiculo)}
                      delay={i * 28}
                    />
                  </div>
                )}

                {/* placa do veículo */}
                {occupied && v.placaVeiculo && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-1 z-20 flex justify-center">
                    <span className="rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-white backdrop-blur-sm">
                      {v.placaVeiculo}
                    </span>
                  </div>
                )}

                {/* ação de liberar, aparece no hover */}
                {occupied && onSaida && v.placaVeiculo && (
                  <button
                    onClick={() => onSaida(v.placaVeiculo!)}
                    className="absolute inset-0 z-30 flex items-center justify-center rounded-md bg-black/0 opacity-0 transition-all hover:bg-black/45 focus:bg-black/45 focus:opacity-100 group-hover:opacity-100"
                    aria-label={`Liberar vaga ${v.numero}`}
                  >
                    <span className="inline-flex items-center gap-1 rounded border border-white/30 bg-white/10 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                      <LogOut size={12} strokeWidth={2} />
                      liberar
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Linhas amarelas + número estampados no asfalto. */
function BayMarkings({ highlight, numero }: { highlight: boolean; numero: number }) {
  const line = highlight ? "bg-accent-300" : "bg-asphalt-line/65";
  return (
    <>
      {/* linha de freio no topo da vaga */}
      <span className={`absolute left-2 right-2 top-1 h-[2px] rounded-full ${line}`} />
      {/* linhas laterais */}
      <span className={`absolute left-1 top-1 h-[86%] w-[2px] rounded-full ${line}`} />
      <span className={`absolute right-1 top-1 h-[86%] w-[2px] rounded-full ${line}`} />
      {/* número estampado */}
      <span
        className={[
          "absolute left-1/2 top-1.5 z-[1] -translate-x-1/2 font-display text-xs font-bold tabular-nums",
          highlight ? "text-accent-200" : "text-asphalt-line/55",
        ].join(" ")}
      >
        {numero}
      </span>
    </>
  );
}

const VARIANT_SHAPE: Record<CarVariant, { aspect: string; radius: string }> = {
  sedan: { aspect: "1 / 1.85", radius: "44% / 13%" },
  conversivel: { aspect: "1 / 1.8", radius: "46% / 14%" },
  suv: { aspect: "1 / 1.68", radius: "34% / 11%" },
  picape: { aspect: "1 / 2", radius: "40% / 10%" },
};

/**
 * Carro visto de cima, montado só com divs. Quatro variações de carroceria
 * (sedan, conversível com capota, SUV e picape), cada uma com seu desenho
 * de cabine. A cor vem do conjunto padrão (CAR_COLORS).
 */
function Car({
  color,
  variant,
  delay,
}: {
  color: string;
  variant: CarVariant;
  delay: number;
}) {
  const dark = isColorDark(color);
  const glass = dark ? "rgba(160,185,210,0.6)" : "rgba(60,80,105,0.55)";
  const seam = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.18)";
  const shape = VARIANT_SHAPE[variant];

  return (
    <div
      className="animate-drive-in h-full"
      style={{ animationDelay: `${delay}ms`, aspectRatio: shape.aspect }}
    >
      <div
        className="car-paint relative h-full w-full shadow-car"
        style={{ backgroundColor: color, borderRadius: shape.radius }}
      >
        {/* faróis dianteiros */}
        <span className="absolute top-[1.5%] left-[15%] h-[3.5%] w-[18%] rounded-full bg-amber-50/90" />
        <span className="absolute top-[1.5%] right-[15%] h-[3.5%] w-[18%] rounded-full bg-amber-50/90" />

        {/* retrovisores */}
        <span className="absolute left-[-6%] top-[24%] h-[6%] w-[8%] rounded-[40%]" style={{ background: color }} />
        <span className="absolute right-[-6%] top-[24%] h-[6%] w-[8%] rounded-[40%]" style={{ background: color }} />

        {variant === "sedan" && (
          <>
            <span className="absolute left-[14%] right-[14%] top-[15%] h-[1px]" style={{ background: seam }} />
            <span className="absolute left-1/2 top-[18%] h-[16%] w-[74%] -translate-x-1/2 rounded-[34%]" style={{ background: glass }} />
            <span className="absolute left-1/2 top-[35%] h-[24%] w-[80%] -translate-x-1/2 rounded-[16%]" style={{ background: "rgba(0,0,0,0.10)" }} />
            <span className="absolute bottom-[19%] left-1/2 h-[13%] w-[74%] -translate-x-1/2 rounded-[34%]" style={{ background: glass }} />
            <span className="absolute left-[14%] right-[14%] bottom-[14%] h-[1px]" style={{ background: seam }} />
          </>
        )}

        {variant === "conversivel" && (
          <>
            {/* para-brisa baixo */}
            <span className="absolute left-1/2 top-[14%] h-[10%] w-[72%] -translate-x-1/2 rounded-[34%]" style={{ background: glass }} />
            {/* habitáculo aberto */}
            <span className="absolute left-1/2 top-[26%] h-[32%] w-[78%] -translate-x-1/2 rounded-[16%]" style={{ background: "#2b2826" }} />
            {/* dois bancos */}
            <span className="absolute left-[26%] top-[31%] h-[14%] w-[20%] rounded-[34%] bg-white/15" />
            <span className="absolute right-[26%] top-[31%] h-[14%] w-[20%] rounded-[34%] bg-white/15" />
            {/* capota dobrada atrás dos bancos */}
            <span className="absolute left-1/2 top-[58%] h-[16%] w-[82%] -translate-x-1/2 rounded-[24%]" style={{ background: "#1a1b1e" }} />
            <span className="absolute left-[16%] right-[16%] top-[66%] h-[1px] bg-white/10" />
            <span className="absolute left-[14%] right-[14%] bottom-[12%] h-[1px]" style={{ background: seam }} />
          </>
        )}

        {variant === "suv" && (
          <>
            <span className="absolute left-[14%] right-[14%] top-[12%] h-[1px]" style={{ background: seam }} />
            <span className="absolute left-1/2 top-[14%] h-[13%] w-[78%] -translate-x-1/2 rounded-[28%]" style={{ background: glass }} />
            {/* teto longo */}
            <span className="absolute left-1/2 top-[29%] h-[37%] w-[84%] -translate-x-1/2 rounded-[12%]" style={{ background: "rgba(0,0,0,0.10)" }} />
            {/* longarinas do teto */}
            <span className="absolute left-[16%] top-[31%] h-[33%] w-[1.5px] rounded-full" style={{ background: seam }} />
            <span className="absolute right-[16%] top-[31%] h-[33%] w-[1.5px] rounded-full" style={{ background: seam }} />
            <span className="absolute bottom-[14%] left-1/2 h-[15%] w-[78%] -translate-x-1/2 rounded-[26%]" style={{ background: glass }} />
            <span className="absolute left-[14%] right-[14%] bottom-[12%] h-[1px]" style={{ background: seam }} />
          </>
        )}

        {variant === "picape" && (
          <>
            <span className="absolute left-[14%] right-[14%] top-[13%] h-[1px]" style={{ background: seam }} />
            <span className="absolute left-1/2 top-[15%] h-[12%] w-[74%] -translate-x-1/2 rounded-[32%]" style={{ background: glass }} />
            {/* cabine curta */}
            <span className="absolute left-1/2 top-[28%] h-[13%] w-[78%] -translate-x-1/2 rounded-[16%]" style={{ background: "rgba(0,0,0,0.10)" }} />
            <span className="absolute left-1/2 top-[42%] h-[6%] w-[72%] -translate-x-1/2 rounded-[30%]" style={{ background: glass }} />
            {/* caçamba aberta */}
            <span className="absolute left-1/2 top-[53%] h-[40%] w-[84%] -translate-x-1/2 rounded-[10%] ring-1 ring-black/25" style={{ background: "rgba(0,0,0,0.30)" }} />
            <span className="absolute left-[14%] right-[14%] bottom-[8%] h-[1px]" style={{ background: "rgba(255,255,255,0.12)" }} />
          </>
        )}

        {/* lanternas traseiras */}
        <span className="absolute bottom-[1.5%] left-[16%] h-[3%] w-[16%] rounded-full bg-red-500/85" />
        <span className="absolute bottom-[1.5%] right-[16%] h-[3%] w-[16%] rounded-full bg-red-500/85" />
      </div>
    </div>
  );
}

function ParkingMark() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-asphalt-line font-display text-[10px] font-bold text-asphalt-950">
      P
    </span>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}
