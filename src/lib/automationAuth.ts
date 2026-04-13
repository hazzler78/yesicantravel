import { NextRequest } from "next/server";

function bearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
}

export function isAutomationAdminAuthorized(request: NextRequest): boolean {
  const adminToken = process.env.REVENUE_AGENT_ADMIN_TOKEN;
  const cronSecret = process.env.REVENUE_AGENT_CRON_SECRET;

  const providedAdmin =
    request.headers.get("x-admin-token") ??
    bearerToken(request) ??
    request.nextUrl.searchParams.get("token");

  const providedCron = request.headers.get("x-cron-secret");

  if (cronSecret && providedCron === cronSecret) return true;
  if (!adminToken) return true;
  return providedAdmin === adminToken;
}
