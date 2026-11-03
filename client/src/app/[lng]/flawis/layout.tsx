import ActivateAccountDialog from "@/app/[lng]/(auth)/activate-account-dialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/session-polling";
import { Access } from "@/lib/graphql/generated/graphql";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
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
  if (!user?.access.includes(Access.Admin)) {
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
          { title: t("users"), href: "/users", icon: "users" },
          {
            title: t("conferences"),
            href: "/conferences",
            icon: "building-library",
          },
          { title: t("internships"), href: "/internships", icon: "briefcase" },
          { title: t("courses"), href: "/courses", icon: "academic-cap" },
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
