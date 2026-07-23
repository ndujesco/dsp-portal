"use client";
import { useState } from "react";

export default function CopyPrompt({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; user can still select the text */
    }
  }
  return (
    <div className="promptbox">
      <button className="btn copybtn" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
      <pre>{text}</pre>
    </div>
  );
}
