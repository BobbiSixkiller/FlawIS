import { FormMessage } from "@/components/Message";
import { getUser } from "../../actions";
import ImpersonateForm from "./ImpersonateForm";
import { redirect } from "next/navigation";

export default async function ImpersonateUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);
  if (!user) {
    redirect("/users");
  }

  return <ImpersonateForm lng={lng} user={user} />;
}
