import { ReactNode } from "react";
import Icon from "@/components/Icon";
import TabMenu from "@/components/TabMenu";

export default async function TabsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { slug } = await params;
  const tabs = [
    {
      href: `/conferences/${slug}`,
      name: "Info",
      icon: <Icon name="information-circle" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/attendees`,
      name: "Ucastnici",
      icon: <Icon name="user-group" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/sections`,
      name: "Sekcie",
      icon: <Icon name="folder-open" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/tickets`,
      name: "Listky",
      icon: <Icon name="ticket" className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <TabMenu tabs={tabs} />
      {children}
    </>
  );
}
