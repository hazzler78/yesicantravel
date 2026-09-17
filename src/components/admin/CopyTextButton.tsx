"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
};

export function CopyTextButton({ text, label = "Copy" }: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex min-h-[40px] items-center justify-center rounded-control border border-border bg-surface px-3 text-sm font-semibold text-ink hover:border-teal/40"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
