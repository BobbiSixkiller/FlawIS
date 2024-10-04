import { FormMessage } from "@/components/Message";
import { getUser } from "../../actions";
import UpdateUserForm from "./UpdateUserForm";

export default async function UpdateUserPage({
  params: { id, lng },
}: {
  params: { id: string; lng: string };
}) {
  const user = await getUser(id);

  return (
    <div className="flex flex-col gap-6 justify-center">
      <FormMessage lng={lng} />
      <UpdateUserForm lng={lng} user={user} />
    </div>
  );
}

export const dynamic = "force-dynamic";
