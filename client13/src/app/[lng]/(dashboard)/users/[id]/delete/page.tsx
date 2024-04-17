import { FormMessage } from "@/components/Message";
import { getUser } from "../../actions";
import DeleteUserForm from "./DeleteUserForm";

export default async function DeleteUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  return (
    <div className="flex flex-col gap-6 justify-center">
      <FormMessage lng={lng} />
      <DeleteUserForm lng={lng} user={user} />
    </div>
  );
}
