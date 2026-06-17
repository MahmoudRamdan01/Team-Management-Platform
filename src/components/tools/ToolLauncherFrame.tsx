"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Tool } from "@/lib/repositories/types";

/**
 * Bridges the new auth into the wrapped legacy tool. It asks the server to mint
 * the `AOI_SESSION_SHARED` payload (server-only secret), writes it to
 * localStorage — which the same-origin iframe reads — then loads the tool.
 */
export function ToolLauncherFrame({ tool }: { tool: Tool }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [src, setSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const launched = useRef(false);

  useEffect(() => {
    if (launched.current) return;
    launched.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/tools/${tool.id}/launch`, {
          method: "POST",
          credentials: "same-origin",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(`Launch failed (HTTP ${res.status}${body.reason ? ` · ${body.reason}` : ""}).`);
          setState("error");
          return;
        }
        const data = (await res.json()) as { session: unknown; launchUrl: string };
        localStorage.setItem("AOI_SESSION_SHARED", JSON.stringify(data.session));
        setSrc(data.launchUrl);
        setState("ready");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Network error.");
        setState("error");
      }
    })();
  }, [tool.id]);

  if (state === "error") {
    return (
      <div className="card grid place-items-center gap-3 p-12 text-center">
        <AlertTriangle className="text-[#FF8E5E]" />
        <p className="text-foam">Could not launch this tool.</p>
        {errorMsg && <p className="font-mono text-xs text-mist">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-9rem)] overflow-hidden rounded-brand border border-white/10">
      {state === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-ink">
          <Loader2 className="animate-spin text-gold" />
        </div>
      )}
      {src && (
        <iframe
          title={tool.name}
          src={src}
          className="h-full w-full"
          allow="clipboard-read; clipboard-write"
        />
      )}
    </div>
  );
}
