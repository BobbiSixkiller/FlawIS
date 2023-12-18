import Logo from "@/components/Logo";
import ResetPasswordForm from "./ResetPasswordForm";
import { useTranslation } from "@/lib/i18n";

export default async function ResetPassword({
  params: { lng },
  searchParams: { token },
}: {
  params: { lng: string };
  searchParams: { token: string };
}) {
  const { t } = await useTranslation(lng, "resetPassword");

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-sm flex min-h-full flex-1 gap-4 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="flex flex-col gap-10">
        <Logo lng={lng} width={60} height={60} notext />

        <h2 className="text-2xl text-center font-bold leading-9 tracking-tight text-gray-900">
          {t("heading")}
        </h2>
      </div>

      <ResetPasswordForm lng={lng} token={token} />
    </div>
  );
}
