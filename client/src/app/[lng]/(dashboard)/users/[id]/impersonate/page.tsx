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

  return (
    <div className="flex flex-col gap-6 justify-center">
      <FormMessage lng={lng} />
      <ImpersonateForm lng={lng} user={user} />
    </div>
  );
}
