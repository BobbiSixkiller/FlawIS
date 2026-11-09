import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Icon from "@/components/icon";
import { getReviewContext } from "@/lib/reviews/actions";
import { getConference } from "../actions";
import TabMenu from "@/components/tab-menu";
import { BreadcrumbLabel } from "@/components/breadcrumb-labels";

export default async function TabsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { slug, lng } = await params;
  const [context, conference] = await Promise.all([
    getReviewContext(),
    getConference(slug),
  ]);
  if (
    !context.isAdmin &&
    !context.scopes.some((s) => s.conference === conference?.id)
  )
    redirect("/conferences");
  const lead =
    context.isAdmin ||
    context.scopes.some((s) => s.conference === conference?.id && !s.section);
  const adminTabs = [
    {
      href: `/conferences/${slug}`,
      name: "Info",
      icon: <Icon name="information-circle" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/attendees`,
      name: lng === "en" ? "Participants" : "Účastníci",
      icon: <Icon name="user-group" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/sections`,
      name: lng === "en" ? "Sections" : "Sekcie",
      icon: <Icon name="folder-open" className="h-5 w-5" />,
    },
    {
      href: `/conferences/${slug}/tickets`,
      name: lng === "en" ? "Tickets" : "Lístky",
      icon: <Icon name="ticket" className="h-5 w-5" />,
    },
  ];

  const tabs = [
    ...(context.isAdmin ? adminTabs : []),
    {
      href: `/conferences/${slug}/reviews`,
      name: lng === "en" ? "Reviews" : "Recenzie",
      icon: <Icon name="document-text" className="size-5" />,
    },
    ...(lead
      ? [
          {
            href: `/conferences/${slug}/review-settings`,
            name: lng === "en" ? "Review settings" : "Nastavenia recenzií",
            icon: <Icon name="pencil" className="size-5" />,
          },
          {
            href: `/conferences/${slug}/activity`,
            name: lng === "en" ? "Activity" : "História",
            icon: <Icon name="document-text" className="size-5" />,
          },
        ]
      : []),
  ];

  return (
    <>
      {conference && (
        <BreadcrumbLabel
          param="slug"
          value={slug}
          path={`/flawis/conferences/${slug}`}
          label={conference.translations[lng === "en" ? "en" : "sk"].name}
        />
      )}
      <TabMenu tabs={tabs} />
      {children}
    </>
  );
}
