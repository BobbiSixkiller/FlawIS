import { getMe } from "@/app/[lng]/(auth)/actions";
import { Role } from "@/lib/graphql/generated/graphql";
import { ReactNode } from "react";

export default async function TabsLayout({
  admin,
  attendee,
  params: { lng, slug },
}: {
  children: ReactNode;
  attendee: ReactNode;
  admin: ReactNode;
  params: { slug: string; lng: string };
}) {
  const user = await getMe();
  console.log(user);

  return (
    <div className="h-full">{user?.role !== Role.Admin ? attendee : admin}</div>
  );
}
