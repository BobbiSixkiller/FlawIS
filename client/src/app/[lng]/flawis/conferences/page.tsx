import Heading from "@/components/Heading";
import { getConferences } from "./actions";
import { PlusIcon } from "@heroicons/react/24/outline";
import { translate } from "@/lib/i18n";
import ListConferences from "../../conferences/ListConferences";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import NewConferenceForm from "./NewConferenceForm";

export default async function Conferences({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "conferences");

  const initialData = await getConferences({});

  const newConferenceDialogId = "new-conference";

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={[
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={newConferenceDialogId}>
                <Button size="sm">
                  <PlusIcon className="size-5" />
                  Nova
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />

      {initialData && <ListConferences initialData={initialData} />}

      <Modal title="Nova konferencia" dialogId={newConferenceDialogId}>
        <NewConferenceForm lng={lng} dialogId={newConferenceDialogId} />
      </Modal>
    </div>
  );
}
