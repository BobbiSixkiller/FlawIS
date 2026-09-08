import ActivateAccountDialog from "@/app/[lng]/(auth)/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import SessionPolling from "@/components/SessionPolling";
import { Access } from "@/lib/graphql/generated/graphql";
import Icon from "@/components/Icon";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import Dashboard from "@/components/Dashboard";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ lng: string }>;
    sidebar: React.ReactNode;
    modal: React.ReactNode;
  },
  parent: ResolvingMetadata
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
  sidebar,
  params,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
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
        sidebar={sidebar}
        lng={lng}
        user={user}
        navLinks={[
          {
            href: "/users",
            icon: <Icon name="users" className="mr-2 h-5 w-5" aria-hidden="true" />,
            text: t("users"),
          },
          {
            href: "/conferences",
            icon: (
              <Icon name="building-library"
                className="mr-2 h-5 w-5"
                aria-hidden="true"
              />
            ),
            text: t("conferences"),
          },
          {
            href: "/internships",
            icon: <Icon name="briefcase" className="mr-2 h-5 w-5" aria-hidden="true" />,
            text: t("internships"),
          },
          {
            href: "/courses",
            icon: (
              <Icon name="academic-cap" className="mr-2 h-5 w-5" aria-hidden="true" />
            ),
            text: t("courses"),
          },
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
