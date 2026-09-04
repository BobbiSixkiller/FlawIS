import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { cookies, headers } from "next/headers";
import MissingStudentDataDialog from "./MissingStudentDataDialog";
import { getSubdomain } from "@/lib/serverUtils";
import ParticipantTenantShell from "@/components/ParticipantTenantShell";
import { getOptionalViewer } from "@/lib/optionalViewer";
import { logoutHref } from "@/lib/authRedirect";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
    sidebar: React.ReactNode;
    modal: React.ReactNode;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await translate(lng, "dashboard");

  const headerStore = await headers();
  const host = headerStore.get("host") || "flawis.flaw.uniba.sk";
  const tenant = host.split(".")[0].replace("-staging", "");

  const url =
    process.env.NODE_ENV !== "development"
      ? new URL(`https://${host}`)
      : undefined;
  const title = `${t("internships")} | ${t("title")}`;
  const description = t(`${tenant}Desc`);

  return {
    metadataBase: url,
    title,
    description,
    openGraph: {
      url,
      type: "website",
      siteName: "FlawIS",
      locale: lng,
      title,
      description,
      images: [`/images/Praf-logo-text-${lng}.png`],
    },
  };
}

export default async function InternshipsLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const [{ lng }, user, subdomain, cookieStore] = await Promise.all([
    params,
    getOptionalViewer(),
    getSubdomain(),
    cookies(),
  ]);
  const signInHref =
    !user && cookieStore.get("accessToken")?.value
      ? logoutHref("/login")
      : "/login";

  return (
    <ParticipantTenantShell
      lng={lng}
      user={user}
      modal={modal}
      sessionPolling={Boolean(user)}
      signInHref={signInHref}
    >
      {children}
      {user ? (
        <MissingStudentDataDialog user={user} subdomain={subdomain} />
      ) : null}
    </ParticipantTenantShell>
  );
}
