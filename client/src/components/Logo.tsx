import Image from "next/image";
import { Trans } from "react-i18next/TransWithoutContext";

import logoInverted from "../../public/images/Flaw-logo-notext-inverted.png";
import logo from "../../public/images/Flaw-logo-notext.png";
import { translate } from "@/lib/i18n";
import { cn } from "@/lib/clientUtils";

export default async function Logo({
  lng,
  notext = false,
  inverted = false,
  height = 60,
  width = 60,
  className,
}: {
  height?: number;
  width?: number;
  lng?: string;
  notext?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  const { t } = await translate(lng || "sk", "dashboard");

  return (
    <div
      className={cn([
        "flex gap-4 font-normal",
        inverted ? "text-white/85" : "text-gray-900 dark:text-white/85",
        className,
      ])}
    >
      {inverted ? (
        <Image
          priority
          src={logoInverted}
          width={width}
          height={height}
          alt="Flaw-logo"
        />
      ) : (
        <>
          <Image
            priority
            src={logo}
            width={width}
            height={height}
            alt="Flaw-logo"
            className="dark:hidden"
          />
          <Image
            priority
            src={logoInverted}
            width={width}
            height={height}
            alt="Flaw-logo"
            className="hidden dark:block"
          />
        </>
      )}
      {!notext && (
        <div className="text-sm flex flex-col self-center leading-none">
          <Trans
            i18nKey={"faculty"}
            t={t}
            components={[
              <span className="uppercase" key={0} />,
              <span className="text-xs" key={1} />,
            ]}
          />
        </div>
      )}
    </div>
  );
}
