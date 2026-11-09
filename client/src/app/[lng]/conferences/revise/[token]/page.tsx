import type { RevisionPortal } from "@/lib/reviews/types";
import RevisionPortalView from "@/components/revision-portal";
import { getPrivatePortal } from "@/lib/reviews/actions";
import { ReviewError } from "@/components/review-controls";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function RevisionPage({
  params,
}: {
  params: Promise<{ token: string; lng: string }>;
}) {
  const { token, lng } = await params;
  const result = await getPrivatePortal(token, "revision");
  if (!result.ok)
    return (
      <main className="mx-auto max-w-xl p-8">
        <ReviewError
          message={
            !result.invalid
              ? lng === "en"
                ? "The service is temporarily unavailable. Reload this page to try again."
                : "Služba je dočasne nedostupná. Obnovte stránku a skúste znova."
              : lng === "en"
                ? "This link is invalid or expired. Contact the conference coordinator."
                : "Odkaz je neplatný alebo expirovaný. Kontaktujte koordinátora konferencie."
          }
        />
      </main>
    );
  return (
    <RevisionPortalView
      initial={result.value as RevisionPortal}
      token={token}
      lng={lng}
    />
  );
}
