"use client";

import { useMemo } from "react";
import type { FilaItem } from "@/lib/types";

type Props = {
  fila: FilaItem[];
  highlightIndex?: number | null;
};

const NODE_W = 56;
const NODE_H = 30;
const X_STEP = 90;
const Y_STEP = 64;
const PAD_X = 16;
const PAD_Y = 16;

type Pos = { i: number; x: number; y: number };

function layoutHeap(n: number): { positions: Pos[]; width: number; height: number } {
  if (n === 0) return { positions: [], width: 0, height: 0 };

  const depth = Math.floor(Math.log2(n)) + 1;
  const leavesAtDepth = (d: number) => Math.min(n - (Math.pow(2, d) - 1), Math.pow(2, d));
  // simple layout: assign each node x based on in-order-like index in a binary tree
  const positions: Pos[] = [];
  let counter = 0;

  function walk(i: number, d: number) {
    if (i >= n) return;
    walk(2 * i + 1, d + 1);
    positions.push({
      i,
      x: PAD_X + counter * (X_STEP / 2) + NODE_W / 2,
      y: PAD_Y + d * Y_STEP + NODE_H / 2,
    });
    counter += 1;
    walk(2 * i + 2, d + 1);
  }
  walk(0, 0);
  const width = PAD_X * 2 + counter * (X_STEP / 2) + NODE_W;
  const height = PAD_Y * 2 + depth * Y_STEP;
  return { positions, width, height };
}

export function HeapView({ fila, highlightIndex }: Props) {
  const { positions, width, height } = useMemo(
    () => layoutHeap(fila.length),
    [fila.length]
  );

  if (fila.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 p-6 text-center text-sm text-ink-500">
        Heap vazio.
      </div>
    );
  }

  const posByIdx = new Map(positions.map((p) => [p.i, p]));

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < fila.length; i++) {
    const p = posByIdx.get(i);
    if (!p) continue;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < fila.length) {
      const pl = posByIdx.get(l);
      if (pl) edges.push({ x1: p.x, y1: p.y, x2: pl.x, y2: pl.y });
    }
    if (r < fila.length) {
      const pr = posByIdx.get(r);
      if (pr) edges.push({ x1: p.x, y1: p.y, x2: pr.x, y2: pr.y });
    }
  }

  return (
    <div className="space-y-4">
      <div className="scrollbar-thin overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="block min-w-full"
          role="img"
          aria-label="Visualização do Min-Heap"
        >
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="#d4d4d4"
              strokeWidth={1}
            />
          ))}
          {positions.map((p) => {
            const item = fila[p.i];
            const hit = p.i === highlightIndex;
            return (
              <g key={p.i}>
                <rect
                  x={p.x - NODE_W / 2}
                  y={p.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={4}
                  fill={hit ? "#16b06a" : "#ffffff"}
                  stroke={hit ? "#0e9659" : "#d4d4d4"}
                />
                <text
                  x={p.x}
                  y={p.y - 1}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={600}
                  fill={hit ? "#ffffff" : "#0a0a0a"}
                >
                  {item.placa}
                </text>
                <text
                  x={p.x}
                  y={p.y + 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="ui-sans-serif"
                  fill={hit ? "#d1fadf" : "#525252"}
                >
                  {item.prioridadeLabel}
                </text>
                <text
                  x={p.x}
                  y={p.y - NODE_H / 2 - 4}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="ui-sans-serif"
                  fill="#737373"
                >
                  [{p.i}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Array subjacente
        </div>
        <div className="scrollbar-thin flex gap-px overflow-x-auto rounded border border-ink-200">
          {fila.map((it, i) => {
            const hit = i === highlightIndex;
            return (
              <div
                key={i}
                className={[
                  "min-w-[88px] flex-1 px-2 py-1.5 transition-colors",
                  hit ? "bg-brand-600 text-white" : "bg-white text-ink-900",
                ].join(" ")}
              >
                <div
                  className={[
                    "text-[9px] uppercase tracking-[0.14em]",
                    hit ? "text-brand-100" : "text-ink-500",
                  ].join(" ")}
                >
                  [{i}] · {it.prioridadeLabel}
                </div>
                <div className="font-mono text-xs font-medium">{it.placa}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
