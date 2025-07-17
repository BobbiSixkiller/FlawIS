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
import UsersFilter from "./UsersFilter";
import { Access } from "@/lib/graphql/generated/graphql";

export default async function Users({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ access?: string[] }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;

  const initialData = await getUsers({
    access: queryParams?.access as Access[],
  });

  const newUserDialogId = "new-user";
  const inviteUserDialogId = "invite-user";

  const { t } = await translate(lng, "users");

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
              <ModalTrigger key={0} dialogId={newUserDialogId}>
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
              <ModalTrigger key={1} dialogId={inviteUserDialogId}>
                <Button size="sm" variant="secondary">
                  <BuildingLibraryIcon className="size-5" />
                  Pozvat instituciu
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />
      <div className="flex justify-between">
        <UsersFilter
          access={[
            Access.Admin,
            Access.Student,
            Access.Organization,
            Access.ConferenceAttendee,
          ]}
        />
        <div className="ml-auto text-xl font-bold dark:text-white">
          {initialData.totalCount}
        </div>
      </div>

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
