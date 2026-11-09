import ActivateAccountDialog from "@/app/[lng]/(auth)/activate-account-dialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/session-polling";
import { Access } from "@/lib/graphql/generated/graphql";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { getReviewContext } from "@/lib/reviews/actions";
import Dashboard from "@/components/dashboard";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
    headerActions: React.ReactNode;
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
  const title = `FlawIS | ${t("flawisDesc")}`;
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

export default async function DashboardLayout({
  children,
  modal,
  headerActions,
  params,
}: {
  children: React.ReactNode;
  headerActions: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const user = await getMe();
  const reviewContext = user ? await getReviewContext() : null;
  const isAdmin = Boolean(user?.access.includes(Access.Admin));
  const canManageLibrary =
    isAdmin || Boolean(reviewContext?.scopes.some((s) => !s.section));
  if (!user || (!isAdmin && !reviewContext?.scopes.length)) {
    redirect("/logout");
  }

  const { lng } = await params;
  const { t } = await translate(lng, "dashboard");

  return (
    <div>
      <Dashboard
        headerActions={headerActions}
        lng={lng}
        user={user}
        navItems={[
          ...(isAdmin
            ? [{ title: t("users"), href: "/users", icon: "users" as const }]
            : []),
          {
            title: t("conferences"),
            href: "/conferences",
            icon: "building-library",
          },
          {
            title: lng === "en" ? "Reviewers" : "Recenzenti",
            href: "/reviewers",
            icon: "users",
          },
          ...(canManageLibrary
            ? [
                {
                  title: lng === "en" ? "Forms" : "Formuláre",
                  href: "/forms",
                  icon: "folder-open" as const,
                },
              ]
            : []),
          ...(isAdmin
            ? [
                {
                  title: t("internships"),
                  href: "/internships",
                  icon: "briefcase" as const,
                },
                {
                  title: t("courses"),
                  href: "/courses",
                  icon: "academic-cap" as const,
                },
              ]
            : []),
        ]}
      >
        {children}
      </Dashboard>

      {modal}

      <ActivateAccountDialog lng={lng} user={user} />
      <SessionPolling />
    </div>
  );
}
