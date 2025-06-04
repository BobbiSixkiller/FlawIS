import Heading from "@/components/Heading";
import { getUsers } from "./actions";
import ListUsers from "./ListUsers";
import { BuildingLibraryIcon, PlusIcon } from "@heroicons/react/24/outline";
import { translate } from "@/lib/i18n";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import UserForm from "../../(auth)/register/UserForm";
import RegistrationInviteForm from "./RegistrationInviteForm";

export default async function Users({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const initialData = await getUsers({});

  const { t } = await translate(lng, "users");

  const newUserDialogId = "new-user";
  const inviteUserDialogId = "invite-user";

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("heading")}
        subHeading="Pouzivatelia registrovani v systeme"
        links={[
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={newUserDialogId}>
                <Button size="sm">
                  <PlusIcon className="size-5" />
                  Novy
                </Button>
              </ModalTrigger>
            ),
          },
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={inviteUserDialogId}>
                <Button size="sm" variant="secondary">
                  <BuildingLibraryIcon className="size-5" />
                  Pozvat instituciu
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />

      {initialData && <ListUsers initialData={initialData} />}

      <Modal title="Novy pouzivatel" dialogId={newUserDialogId}>
        <UserForm namespace="register" dialogId={newUserDialogId} />
      </Modal>
      <Modal title="Pozvat institucie" dialogId={inviteUserDialogId}>
        <RegistrationInviteForm dialogId={inviteUserDialogId} />
      </Modal>
    </div>
  );
}
