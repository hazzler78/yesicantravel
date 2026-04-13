"use client";

import { useEffect, useMemo, useState } from "react";

type ActionResult = {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
};

async function postJson(path: string, token: string, payload?: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(payload ?? {}),
  });
  const json = (await response.json().catch(() => ({}))) as ActionResult;
  if (!response.ok) throw new Error(json.error ?? `Request failed (${response.status})`);
  return json;
}

export default function RevenueAgentActionPanel({
  periodMonth,
  approvalRequestId,
}: {
  periodMonth: string;
  approvalRequestId?: string;
}) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [approvalId, setApprovalId] = useState(approvalRequestId ?? "");
  const normalizedToken = useMemo(() => {
    const raw = token.trim();
    if (!raw) return "";
    if (raw.startsWith("REVENUE_AGENT_ADMIN_TOKEN=")) {
      return raw.slice("REVENUE_AGENT_ADMIN_TOKEN=".length).trim();
    }
    return raw;
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("revenue_agent_admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (normalizedToken) {
      window.localStorage.setItem("revenue_agent_admin_token", normalizedToken);
    }
  }, [normalizedToken]);

  const runAction = async (id: string, fn: () => Promise<ActionResult>) => {
    setLoading(id);
    setResult("");
    try {
      const json = await fn();
      if (id === "proposal") {
        const newApprovalId = String((json.approvalRequest as { id?: string } | undefined)?.id ?? "");
        if (newApprovalId) setApprovalId(newApprovalId);
      }
      setResult(`${id}: success`);
    } catch (error) {
      setResult(`${id}: ${(error as Error).message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-[var(--sand)] bg-white p-5">
      <h2 className="text-lg font-semibold">Action panel</h2>
      <p className="mt-1 text-sm text-[var(--navy-light)]">
        One-click operator actions for monthly cycle, proposal, approval, and guarded ad execution.
      </p>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        type="text"
        placeholder="atlas_admin_token_2026 or REVENUE_AGENT_ADMIN_TOKEN=..."
        className="mt-3 w-full rounded-lg border border-[var(--sand)] px-3 py-2 text-sm"
      />
      <p className="mt-2 text-xs text-[var(--navy-light)]">
        Token length: {normalizedToken.length}. Empty token will return Unauthorized from API.
      </p>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <button
          className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() =>
            runAction("monthly_run", () =>
              postJson("/api/automation/jobs/run", normalizedToken, { mode: "monthly", periodMonth })
            )
          }
        >
          {loading === "monthly_run" ? "Running..." : "Run monthly cycle"}
        </button>
        <button
          className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() =>
            runAction("proposal", () =>
              postJson("/api/automation/ads/proposal", normalizedToken, { periodMonth })
            )
          }
        >
          {loading === "proposal" ? "Generating..." : "Generate ad proposal"}
        </button>
        <button
          className="rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={Boolean(loading) || !approvalId}
          onClick={() =>
            runAction("approve_yes", () =>
              postJson("/api/automation/approval", normalizedToken, {
                approvalRequestId: approvalId,
                decision: "approve",
                approvalText: "YES",
                note: "Approved from admin action panel",
              })
            )
          }
        >
          {loading === "approve_yes" ? "Approving..." : "Approve with YES"}
        </button>
        <button
          className="rounded-lg bg-[var(--plum,#6f3f6c)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() =>
            runAction("ads_execute", () =>
              postJson("/api/automation/ads/execute", normalizedToken, { periodMonth })
            )
          }
        >
          {loading === "ads_execute" ? "Executing..." : "Run ads execution"}
        </button>
      </div>
      {approvalId ? (
        <p className="mt-3 text-xs text-[var(--navy-light)]">Active approval request: {approvalId}</p>
      ) : (
        <p className="mt-3 text-xs text-[var(--navy-light)]">No approval request ID yet. Generate proposal first.</p>
      )}
      {result && <p className="mt-3 text-sm font-medium text-[var(--navy)]">{result}</p>}
    </section>
  );
}
