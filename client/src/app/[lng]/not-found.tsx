import Logo from "@/components/Logo";
import { translate } from "@/lib/i18n";
import { HomeIcon } from "@heroicons/react/24/outline";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function NotFound() {
  const cookieStore = await cookies();
  const lng = cookieStore.get("NEXT_locale")?.value || "sk";
  const { t } = await translate(lng, ["common", "landing"]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 dark:bg-gray-900">
      <div>
        <Logo lng={lng} height={60} width={60} />
      </div>
      <h1 className="text-2xl dark:text-white/85">
        {t("notFoundMsg", { ns: "common" })}
      </h1>
      <Link
        href="/"
        className="rounded-full px-5 py-2 text-white bg-primary-500 hover:bg-primary-700 flex gap-2 items-center"
      >
        <HomeIcon className="h-5 w-5" />
        {t("home", { ns: "dashboard" })}
      </Link>
    </div>
  );
}
