import { ReactNode } from "react";
import Icon from "@/components/icon";
import Dropdown, { DropdownItem } from "./dropdown";
import { translate } from "@/lib/i18n";

interface HeadingProps {
  heading: string;
  subHeading?: ReactNode;
  items?: DropdownItem[];
  lng: string;
}

export default async function Heading({
  heading,
  subHeading,
  items = [],
  lng,
}: HeadingProps) {
  const { t } = await translate(lng, "common");

  const [primaryAction, ...secondaryActions] = items;

  return (
    <div className="lg:flex lg:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="w-full text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {heading}
        </h1>
        {subHeading && (
          <div className="mt-2 flex flex-col sm:mt-2 sm:flex-row sm:flex-wrap sm:space-x-6 text-muted-foreground dark:text-muted-foreground text-sm">
            {subHeading}
          </div>
        )}
      </div>
      <div className="mt-5 flex gap-3 lg:ml-4 lg:mt-0">
        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-3 ">{secondaryActions}</div>

        {/* Primary button */}
        {primaryAction}

        {/* Mobile dropdown */}
        {secondaryActions.length > 0 && (
          <div className="sm:hidden">
            <Dropdown
              anchor={{ gap: 4, to: "bottom end" }}
              trigger={
                <>
                  {t("more")}
                  <Icon name="chevron-down-solid"
                    className="-mr-1 ml-1.5 size-5"
                    aria-hidden="true"
                  />
                </>
              }
              triggerProps={{ variant: "secondary", size: "sm" }}
              items={secondaryActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
