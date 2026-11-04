"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export default function CopyButton({
  textToCopy,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers with restricted clipboard
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
        copied
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
          : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600"
      } ${className}`}
      title={copied ? copiedLabel : `Copy "${textToCopy}"`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
