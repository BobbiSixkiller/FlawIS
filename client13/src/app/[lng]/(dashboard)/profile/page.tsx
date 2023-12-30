import { useTranslation } from "@/lib/i18n";
import { getMe } from "../../(auth)/actions";
import ProfileForm from "./ProfileForm";

export default async function Profile({
  params: { lng },
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng, "profile");
  const user = await getMe();

  return (
    <div className="flex justify-center">
      <div className="w-full md:max-w-md flex flex-col gap-4">
        <h1 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
          {t("heading")}
        </h1>
        <ProfileForm lng={lng} user={user} />
      </div>
    </div>
  );
}
