"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X } from "lucide-react";

function urlMobile(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/mobile`;
}

export function QrConvite() {
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(urlMobile());
  }, []);

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-400 active:translate-y-px"
      >
        <QrCode size={12} strokeWidth={1.75} />
        QR do celular
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-ink-200 bg-white p-8 text-center shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAberto(false)}
              className="absolute right-4 top-4 text-ink-400 hover:text-ink-700"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-lg font-bold text-ink-950">
              Aponte a câmera do celular
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Estacione e saia do pátio em tempo real
            </p>
            <div className="mt-6 flex justify-center">
              {url && (
                <QRCodeSVG
                  value={url}
                  size={260}
                  level="M"
                  marginSize={2}
                />
              )}
            </div>
            <div className="mt-5 break-all rounded border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-600">
              {url}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
