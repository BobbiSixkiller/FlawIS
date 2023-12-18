import ActivateAccountDialog from "@/components/ActivateAccountDialog";
import { getMe } from "../(auth)/actions";
import { Nav } from "@/components/Nav";

export default async function DashboardLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const user = await getMe();

  return (
    <Nav lng={lng} user={user}>
      {children}
      <ActivateAccountDialog lng={lng} user={user} />
    </Nav>
  );
}
