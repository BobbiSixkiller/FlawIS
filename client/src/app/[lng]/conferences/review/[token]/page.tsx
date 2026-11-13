import type { Portal } from "@/lib/reviews/types";
import ReviewerPortal from "@/app/[lng]/conferences/review/[token]/_components/reviewer-portal";
import { getPrivatePortal } from "@/lib/reviews/actions";
import { ErrorAlert } from "@/components/form/field-controls";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string; lng: string }>;
}) {
  const { token, lng } = await params;
  const result = await getPrivatePortal(token, "review");
  if (!result.ok)
    return (
      <main className="mx-auto max-w-xl p-8">
        <ErrorAlert
          message={
            !result.invalid
              ? lng === "en"
                ? "The service is temporarily unavailable. Reload this page to try again."
                : "Služba je dočasne nedostupná. Obnovte stránku a skúste znova."
              : lng === "en"
                ? "This link is invalid, expired or revoked. Contact the conference coordinator."
                : "Odkaz je neplatný, expirovaný alebo zrušený. Kontaktujte koordinátora konferencie."
          }
        />
      </main>
    );
  return (
    <ReviewerPortal initial={result.value as Portal} token={token} lng={lng} />
  );
}
