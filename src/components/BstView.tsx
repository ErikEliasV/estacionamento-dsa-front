"use client";

import { useMemo } from "react";
import type { BstNode } from "@/lib/types";

type Props = {
  tree: BstNode;
  visited?: number[];
  highlight?: number | null;
};

type Positioned = {
  numero: number;
  ocupada: boolean;
  placa: string | null;
  x: number;
  y: number;
  left: Positioned | null;
  right: Positioned | null;
};

const NODE_R = 18;
const X_STEP = 56;
const Y_STEP = 70;
const PAD_X = 24;
const PAD_Y = 24;

function layout(node: BstNode): {
  root: Positioned | null;
  width: number;
  height: number;
} {
  if (!node) return { root: null, width: 0, height: 0 };

  let index = 0;
  let maxDepth = 0;

  function place(n: BstNode, depth: number): Positioned | null {
    if (!n) return null;
    const left = place(n.left, depth + 1);
    const x = PAD_X + index * X_STEP + NODE_R;
    const y = PAD_Y + depth * Y_STEP + NODE_R;
    index += 1;
    if (depth > maxDepth) maxDepth = depth;
    const right = place(n.right, depth + 1);
    return {
      numero: n.numero,
      ocupada: n.ocupada,
      placa: n.placaVeiculo,
      x,
      y,
      left,
      right,
    };
  }

  const root = place(node, 0);
  const width = PAD_X * 2 + index * X_STEP;
  const height = PAD_Y * 2 + (maxDepth + 1) * Y_STEP;
  return { root, width, height };
}

export function BstView({ tree, visited = [], highlight }: Props) {
  const { root, width, height } = useMemo(() => layout(tree), [tree]);
  const visitedSet = new Set(visited);

  if (!root) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 p-6 text-center text-sm text-ink-500">
        Nenhuma vaga configurada.
      </div>
    );
  }

  const nodes: Positioned[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  (function collect(n: Positioned) {
    nodes.push(n);
    if (n.left) {
      edges.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y });
      collect(n.left);
    }
    if (n.right) {
      edges.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y });
      collect(n.right);
    }
  })(root);

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="block min-w-full"
        role="img"
        aria-label="Árvore binária de busca das vagas"
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
        {nodes.map((n) => {
          const isHit = n.numero === highlight;
          const isVisited = visitedSet.has(n.numero) && !isHit;
          const fill = isHit
            ? "#16b06a"
            : isVisited
            ? "#fef3c7"
            : n.ocupada
            ? "#f5f5f5"
            : "#ffffff";
          const stroke = isHit
            ? "#0e9659"
            : isVisited
            ? "#f59e0b"
            : n.ocupada
            ? "#737373"
            : "#d4d4d4";
          const textColor = isHit ? "#ffffff" : "#0a0a0a";
          const subColor = isHit ? "#d1fadf" : "#525252";
          return (
            <g key={n.numero}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={isHit || isVisited ? 1.5 : 1}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="ui-sans-serif, system-ui"
                fontWeight={600}
                fill={textColor}
              >
                {n.numero}
              </text>
              {n.ocupada && n.placa && (
                <text
                  x={n.x}
                  y={n.y + NODE_R + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                  fill={subColor}
                >
                  {n.placa}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
