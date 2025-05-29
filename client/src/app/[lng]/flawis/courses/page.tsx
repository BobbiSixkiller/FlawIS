import Heading from "@/components/Heading";
import { translate } from "@/lib/i18n";
import { PlusIcon } from "@heroicons/react/24/outline";

export default async function CoursesPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <Heading
        lng={lng}
        heading="Kurzy"
        subHeading="Kurzy na falkute"
        links={[
          {
            href: "/courses/new",
            text: "Novy",
            icon: <PlusIcon className="size-5" />,
          },
        ]}
      />
    </div>
  );
}
