import "server-only";
import { cookies } from "next/headers";
async function call(path: string, body: unknown, internal = false) {
  const store = await cookies();
  const response = await fetch(
    `${(process.env.API_URI || "http://core:5000/graphql").replace(/\/graphql\/?$/, "")}/review-files/${path}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: store
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
        ...(internal
          ? {
              "x-notification-secret":
                process.env.NOTIFICATION_SECRET || process.env.SECRET || "",
            }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok)
    throw new Error((await response.json()).error || "File access denied.");
}
export async function authorizeStorage(
  urls: string[],
  operation: "READ" | "DELETE",
) {
  if (urls.length) await call("authorize-legacy", { urls, operation });
}
export async function registerStorage(url: string) {
  await call("register-legacy", { url }, true);
}

export async function authorizeUpload() {
  await call("authorize-legacy", { urls: [], operation: "UPLOAD" });
}
