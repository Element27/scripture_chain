"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { getNodeUrl, getBaseUrl } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils";

interface QRShareProps {
  slug: string;
}

export function QRShare({ slug }: QRShareProps) {
  const [copied, setCopied] = useState(false);
  const url = getNodeUrl(slug);

  const handleCopy = async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-bg-surface rounded-lg border border-gold/20">
      <div className="bg-white p-4 rounded-lg">
        <QRCode value={url} size={180} level="M" />
      </div>

      <div className="text-center">
        <p className="text-cream-muted font-ui text-sm mb-3">
          Share this with someone. Pass it forward.
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 bg-bg-elevated border border-gold/20 rounded text-cream text-sm font-ui truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gold text-bg-deep font-ui text-sm font-medium rounded hover:bg-gold-light transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}