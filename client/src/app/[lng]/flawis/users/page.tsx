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
import { Access, UsersQueryVariables } from "@/lib/graphql/generated/graphql";
import FilterDropdown from "@/components/FilterDropdown";

export default async function Users({
  params,
  searchParams,
}: {
  params: Promise<{ lng: string }>;
  searchParams?: Promise<{ access?: string[] }>;
}) {
  const { lng } = await params;
  const queryParams = await searchParams;

  const { t } = await translate(lng, "users");

  const vars: UsersQueryVariables = {
    sort: [],
    filter: { access: queryParams?.access as Access[] },
  };

  const initialData = await getUsers(vars);

  const newUserDialogId = "new-user";
  const inviteUserDialogId = "invite-user";

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("heading")}
        subHeading="Pouzivatelia registrovani v systeme"
        items={[
          <ModalTrigger key={0} dialogId={newUserDialogId}>
            <Button size="sm">
              <PlusIcon className="size-5" />
              Novy
            </Button>
          </ModalTrigger>,
          <ModalTrigger key={1} dialogId={inviteUserDialogId}>
            <Button size="sm" variant="secondary">
              <BuildingLibraryIcon className="size-5" />
              Pozvat instituciu
            </Button>
          </ModalTrigger>,
        ]}
      />
      <div className="flex justify-between">
        <FilterDropdown
          anchor={{ gap: 6, to: "bottom start" }}
          filters={[
            {
              label: "Access",
              type: "multi",
              queryKey: "access",
              options: [
                { label: Access.Admin, value: Access.Admin },
                { label: Access.Student, value: Access.Student },
                { label: Access.Organization, value: Access.Organization },
                {
                  label: Access.ConferenceAttendee,
                  value: Access.ConferenceAttendee,
                },
              ],
            },
          ]}
        />

        <div className="ml-auto text-xl font-bold dark:text-white">
          {initialData.totalCount}
        </div>
      </div>

      {initialData && <ListUsers vars={vars} initialData={initialData} />}

      <Modal title="Novy pouzivatel" dialogId={newUserDialogId}>
        <UserForm namespace="register" dialogId={newUserDialogId} />
      </Modal>
      <Modal title="Pozvat institucie" dialogId={inviteUserDialogId}>
        <RegistrationInviteForm dialogId={inviteUserDialogId} />
      </Modal>
    </div>
  );
}
