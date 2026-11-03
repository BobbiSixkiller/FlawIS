import Heading from "@/components/heading";
import { getConferences } from "./actions";
import Icon from "@/components/icon";
import { translate } from "@/lib/i18n";
import OfferingList from "@/components/offering-list";
import ModalTrigger from "@/components/modal-trigger";
import Modal from "@/components/modal";
import NewConferenceForm from "./new-conference-form";

export default async function Conferences({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await translate(lng, "conferences");

  const initialData = await getConferences({ sort: [] });

  const newConferenceDialogId = "new-conference";

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        items={[
          <ModalTrigger dialogId={newConferenceDialogId} key={0} size="sm">
            <Icon name="plus" className="size-5" />
            Nova
          </ModalTrigger>,
        ]}
      />

      {initialData && (
        <OfferingList
          kind="conference"
          initialData={initialData}
          vars={{ sort: [] }}
          hrefBase="/conferences"
          lng={lng}
        />
      )}

      <Modal title="Nova konferencia" dialogId={newConferenceDialogId}>
        <NewConferenceForm lng={lng} dialogId={newConferenceDialogId} />
      </Modal>
    </div>
  );
}
