"use client";

import { useState } from "react";

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

  const runAction = async (id: string, fn: () => Promise<ActionResult>) => {
    if (!token.trim()) {
      setResult("Set REVENUE_AGENT_ADMIN_TOKEN first.");
      return;
    }
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
        type="password"
        placeholder="REVENUE_AGENT_ADMIN_TOKEN"
        className="mt-3 w-full rounded-lg border border-[var(--sand)] px-3 py-2 text-sm"
      />
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <button
          className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={Boolean(loading)}
          onClick={() =>
            runAction("monthly_run", () =>
              postJson("/api/automation/jobs/run", token, { mode: "monthly", periodMonth })
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
              postJson("/api/automation/ads/proposal", token, { periodMonth })
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
              postJson("/api/automation/approval", token, {
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
              postJson("/api/automation/ads/execute", token, { periodMonth })
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
