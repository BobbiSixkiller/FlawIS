import { proxyReachWebhook } from "@/lib/reachWebhookProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyReachWebhook(request);
}
