import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import { conferenceSections } from "./actions";
import {
  SectionFragment,
  SubmissionFilesFragment,
} from "@/lib/graphql/generated/graphql";
import Button from "@/components/Button";
import ModalTrigger from "@/components/ModalTrigger";
import Modal from "@/components/Modal";
import SectionForm from "./SectionForm";
import DeleteSectionForm from "./DeleteSectionForm";

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}) {
  const { slug, lng } = await params;
  const conference = await conferenceSections({
    slug,
    first: 1000,
  });

  const newSectionDialogId = "new-section";

  return (
    <div>
      <ModalTrigger dialogId={newSectionDialogId}>
        <Button size="sm">
          <PlusIcon className="h-5 w-5" />
          Nova
        </Button>
      </ModalTrigger>

      <div className="-mx-6 sm:mx-0 divide-y dark:divide-gray-600">
        {conference?.sections.map((s) => (
          <Section key={s.id} lng={lng} section={s} />
        ))}
      </div>

      <Modal title="Nova sekcia" dialogId={newSectionDialogId}>
        <SectionForm
          dialogId={newSectionDialogId}
          conferenceId={conference.id}
        />
      </Modal>
    </div>
  );
}

function Section({
  lng,
  section,
}: {
  lng: string;
  section: SectionFragment & { submissions: SubmissionFilesFragment };
}) {
  function countFiles(submissions: SubmissionFilesFragment) {
    return submissions.edges?.reduce((acc, edge) => {
      if (edge?.node.fileUrl) {
        return acc + 1;
      } else return acc;
    }, 0);
  }

  const updateSectionDialogId = "update-section";
  const deleteSectionDialogId = "delete-section";

  const dropdownItems: DropdownItem[] = [
    {
      type: "custom",
      element: (
        <ModalTrigger dialogId={updateSectionDialogId}>
          <Button size="sm">Aktualizovat</Button>
        </ModalTrigger>
      ),
    },
    {
      type: "custom",
      element: (
        <ModalTrigger dialogId={deleteSectionDialogId}>
          <Button size="sm">Zmazat</Button>
        </ModalTrigger>
      ),
    },
  ];

  return (
    <div className="p-6 sm:p-4 flex justify-between sm:items-center gap-4 dark:text-white">
      <div className="flex flex-col w-3/4">
        <span className="text-lg">
          {section.translations[lng as "sk" | "en"].name}
        </span>
        <span className="text-sm text-gray-400">
          {section.translations[lng as "sk" | "en"].topic}
        </span>
        <span className="whitespace-nowrap sm:hidden text-sm">
          {countFiles(section.submissions)}/ {section.submissions.totalCount}
        </span>
      </div>

      <span className="whitespace-nowrap hidden sm:block">
        {countFiles(section.submissions)} / {section.submissions.totalCount}
      </span>

      <Dropdown
        trigger={
          <Button variant="ghost" size="icon">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </Button>
        }
        items={
          countFiles(section.submissions) > 0
            ? [
                ...dropdownItems,
                {
                  type: "link",
                  href: `/minio?bucketName=${section.conference?.slug}${
                    section.submissions.edges
                      .map((sub) =>
                        sub?.node.fileUrl ? `&url=${sub.node.fileUrl}` : null
                      ) // Return null for invalid entries
                      .filter(Boolean) // Filter out null values
                      .join("") // Join without adding commas
                  }`,
                  text: "Prispevky.zip",
                },
              ]
            : dropdownItems
        }
      />

      <Modal dialogId={deleteSectionDialogId} title="Zmazat sekciu">
        <DeleteSectionForm
          dialogId={deleteSectionDialogId}
          lng={lng}
          section={section}
        />
      </Modal>
      <Modal dialogId={updateSectionDialogId} title="Aktualizovat sekciu">
        <SectionForm
          dialogId={updateSectionDialogId}
          conferenceId={section.conference?.id}
          section={section}
        />
      </Modal>
    </div>
  );
}
