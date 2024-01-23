import { ReactNode } from "react";

export default function Heading({
  heading,
  subHeading,
  actions,
}: {
  heading: string;
  subHeading?: string;
  actions: ReactNode;
}) {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold leading-7 text-gray-900">
          {heading}
        </h1>
        {subHeading && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            {subHeading}
          </p>
        )}
      </div>
      <div>{actions}</div>
    </div>
  );
}
