import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import { Trans } from "react-i18next/TransWithoutContext";

export default async function Logo({
  lng,
  notext = false,
  inverted = false,
  height,
  width,
}: {
  height: number;
  width: number;
  lng: string;
  notext?: boolean;
  inverted?: boolean;
}) {
  const { t } = await useTranslation(lng, "landing");

  return (
    <div
      className={`flex gap-4 font-normal m-auto ${
        inverted ? "text-white" : "text-gray-900"
      }`}
    >
      <Image
        src={
          inverted
            ? "/images/Flaw-logo-notext-inverted.png"
            : "/images/Flaw-logo-notext.png"
        }
        width={width}
        height={height}
        alt="Flaw-logo"
      />
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
