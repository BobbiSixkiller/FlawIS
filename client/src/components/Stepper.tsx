"use client";

import { useTranslation } from "@/lib/i18n/client";
import { ReactElement } from "react";

export default function Stepper({
  steps,
  activeIndex,
  lng,
}: {
  steps: ReactElement[];
  activeIndex: number;
  lng: string;
}) {
  const { t } = useTranslation(lng, "common");

  function calculateBorderColor(stepIndex: number, activeIndex: number) {
    if (activeIndex === stepIndex) {
      return "border-primary-300";
    }
    if (activeIndex > stepIndex) {
      return "border-primary-600";
    }
    return "border-gray-200";
  }

  return (
    <ol className="md:flex items-start justify-center space-y-4 md:space-x-8 md:space-y-0 w-full">
      {steps.map((s, i) => (
        <li className="flex-1 max-w-40" key={i}>
          <div
            className={`border-l-2 flex flex-col border-t-0 pl-4 pt-0 border-solid ${calculateBorderColor(
              i,
              activeIndex
            )} font-medium md:pt-4 md:border-t-2 md:border-l-0 md:pl-0`}
          >
            <span
              className={`text-sm md:text-base ${
                i > activeIndex ? "text-gray-400" : "text-primary-600"
              }`}
            >
              {t("step") + " " + Number(i + 1)}
            </span>
            <h4 className="text-base md:text-md text-gray-900">
              {s.props.name}
            </h4>
          </div>
        </li>
      ))}
    </ol>
  );
}
