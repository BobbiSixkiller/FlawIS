import Heading from "@/components/Heading";
import { getConference } from "../../../../actions";
import ConferenceRegistrationForm from "../../../@admin/register/ConferenceRegistrationForm";
import { getSubmission } from "../../../@admin/register/actions";
import { getMe } from "@/app/[lng]/(auth)/actions";
import { redirect } from "next/navigation";
import { Conference } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n";

export default async function RegisterPage({
  params: { lng, slug },
  searchParams,
}: {
  params: { slug: string; lng: string };
  searchParams?: {
    submission?: string;
  };
}) {
  const user = await getMe();

  const [conference, submission] = await Promise.all([
    getConference(slug),
    getSubmission(searchParams?.submission),
  ]);
  if (conference && conference.attending) {
    redirect(`/conferences/${slug}`);
  }

  const { t } = await useTranslation(lng, "conferences");

  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading={t("registration.heading")}
        subHeading={conference!.translations[lng as "sk" | "en"].name}
      />
      <ConferenceRegistrationForm
        lng={lng}
        conference={conference as Conference}
        submission={submission}
        billings={user!.billings}
      />
    </div>
  );
}
