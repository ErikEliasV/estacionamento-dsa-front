"use client";

import { ArrowRight, Check, Circle, Eye, Shuffle, XCircle } from "lucide-react";
import type { TraceStep } from "@/lib/dsa";

type Props = {
  title?: string;
  bigO?: string;
  steps: TraceStep[];
};

const KIND_META = {
  info: { Icon: Circle, color: "text-ink-500" },
  visit: { Icon: Eye, color: "text-ink-700" },
  match: { Icon: Check, color: "text-ink-950" },
  swap: { Icon: Shuffle, color: "text-ink-700" },
  result: { Icon: ArrowRight, color: "text-ink-950" },
  error: { Icon: XCircle, color: "text-ink-950" },
} as const;

export function TracePanel({ title = "Última operação", bigO, steps }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          {title}
        </div>
        {bigO && (
          <code className="rounded border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-[10px] text-ink-700">
            {bigO}
          </code>
        )}
      </div>
      {steps.length === 0 ? (
        <div className="rounded border border-dashed border-ink-300 p-4 text-xs text-ink-500">
          Execute uma entrada ou saída para ver o traço algorítmico.
        </div>
      ) : (
        <ol className="space-y-1.5">
          {steps.map((s, i) => {
            const meta = KIND_META[s.kind];
            const Icon = meta.Icon;
            return (
              <li
                key={i}
                className="flex items-start gap-2 rounded border border-ink-200 bg-white px-3 py-2 text-xs leading-snug animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  <Icon size={12} strokeWidth={1.75} className={meta.color} />
                </span>
                <span className="flex-1 text-ink-800">
                  <span className="mr-1.5 font-mono text-[10px] text-ink-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.text}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
