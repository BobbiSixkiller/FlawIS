import { FormMessage } from "@/components/Message";
import NewUserForm from "./NewUserForm";

export default function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <div className="flex flex-col gap-6 justify-center">
      <FormMessage lng={lng} />
      <NewUserForm lng={lng} />
    </div>
  );
}
