import { getMe } from "@/app/[lng]/(auth)/actions";
import { Role } from "@/lib/graphql/generated/graphql";
import { ReactNode } from "react";
import { getConference } from "../actions";
import {
  FolderOpenIcon,
  InformationCircleIcon,
  TicketIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import TabMenu from "@/components/TabMenu";

export default async function TabsLayout({
  attendee,
  children,
  params: { lng, slug },
}: {
  children: ReactNode;
  attendee: ReactNode;
  params: { slug: string; lng: string };
}) {
  const user = await getMe();

  if (user?.role !== Role.Admin) {
    return <div className="h-full">{attendee}</div>;
  }

  return (
    <div className="h-full">
      <TabMenu
        tabs={[
          {
            href: `/conferences/${slug}`,
            name: "Info",
            icon: <InformationCircleIcon className="h-5 w-5" />,
          },
          {
            href: `/conferences/${slug}/attendees`,
            name: "Ucastnici",
            icon: <UserGroupIcon className="h-5 w-5" />,
          },
          {
            href: `/conferences/${slug}/sections`,
            name: "Sekcie",
            icon: <FolderOpenIcon className="h-5 w-5" />,
          },
          {
            href: `/conferences/${slug}/tickets`,
            name: "Listky",
            icon: <TicketIcon className="h-5 w-5" />,
          },
        ]}
      />

      {children}
    </div>
  );
}
