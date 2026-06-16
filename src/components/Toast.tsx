"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastMessage = {
  id: number;
  text: string;
  variant: "success" | "error" | "info";
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

const STYLES: Record<ToastMessage["variant"], string> = {
  success: "border-ink-300 bg-white text-ink-950",
  error: "border-ink-950 bg-ink-950 text-white",
  info: "border-ink-300 bg-white text-ink-950",
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function ToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[340px] flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4200);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = ICONS[toast.variant];
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-2.5 rounded border px-3.5 py-3 text-sm shadow-lift animate-slide-up ${STYLES[toast.variant]}`}
    >
      <Icon size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
      <div className="flex-1 leading-snug">{toast.text}</div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-50 transition-opacity hover:opacity-100"
        aria-label="Fechar"
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
