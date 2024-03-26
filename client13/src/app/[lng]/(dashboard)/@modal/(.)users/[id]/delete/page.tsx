import DeleteUserForm from "@/app/[lng]/(dashboard)/users/[id]/DeleteUserForm";
import { getUser } from "@/app/[lng]/(dashboard)/users/actions";
import { Message } from "@/components/Message";
import Modal2 from "@/components/Modal2";

export default async function DeleteUserPage({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);

  return (
    <Modal2 title="delete">
      <DeleteUserForm user={user} lng={lng} />
    </Modal2>
  );
}
