import Heading from "@/components/Heading";
import { useTranslation } from "@/lib/i18n";
import { downloadFile } from "@/lib/minio";
import { getConferences } from "./actions";
import ListConferences from "./ListConferences";
import { getMe } from "../../(auth)/actions";
import { NewConferenceLink } from "./new/NewConferenceForm";

export default async function Conferences({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "conferences");

  const user = await getMe();

  async function download() {
    "use server";

    const stream = await downloadFile(
      "conferences",
      "BPF2024/trest/157c1e0f-64f2-43a9-a20f-7d208cfab147-cv-matus-muransky.docx.pdf"
    );

    return stream;
  }

  const initialData = await getConferences();

  return (
    <div className="flex flex-col gap-6">
      <Heading
        heading={t("heading")}
        subHeading={t("subheading")}
        lng={lng}
        links={[<NewConferenceLink key={0} />]}
      />
      {initialData && <ListConferences initialData={initialData} lng={lng} />}
    </div>
  );
}
