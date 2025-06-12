import { getConference } from "../actions";
import Heading from "@/components/Heading";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { displayDate } from "@/utils/helpers";
import DynamicImage from "@/components/DynamicImage";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import UpdateDatesForm from "./UpdateDatesForm";
import DeleteConferenceForm from "./DeleteConferenceForm";

export default async function ConferencePage({
  params: { lng, slug },
}: {
  params: { slug: string; lng: string };
}) {
  const conference = await getConference(slug);

  const updateDatesDialogId = "update-dates";
  const deleteConfDialogId = "delete-conference";

  return (
    <div className="text-gray-900 dark:text-white flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <DynamicImage
          alt="conference-logo"
          src={
            conference!.translations[lng as "sk" | "en"].logoUrlEnv as string
          }
          className="w-[300px] h-[150px]"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
        />

        <Heading
          lng={lng}
          heading={conference!.slug}
          subHeading={conference!.translations[lng as "sk" | "en"].name}
          links={[
            {
              type: "custom",
              element: (
                <ModalTrigger dialogId={updateDatesDialogId}>
                  <Button size="sm">
                    <PencilIcon className="size-5" />
                    Aktualizovat
                  </Button>
                </ModalTrigger>
              ),
            },
            {
              type: "custom",
              element: (
                <ModalTrigger dialogId={deleteConfDialogId}>
                  <Button size="sm" variant="secondary">
                    <TrashIcon className="size-5" />
                    Zmazat
                  </Button>
                </ModalTrigger>
              ),
            },
          ]}
        />
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700">
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Zaciatok
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.start)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Koniec
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.end)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Koniec registracie
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.regEnd)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Deadline zaslania prispevkov
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.submissionDeadline)}
            </dd>
          </div>
        </dl>
      </div>

      <Modal dialogId={updateDatesDialogId} title="Aktualizovat datumy">
        <UpdateDatesForm
          dialogId={updateDatesDialogId}
          conference={conference}
          lng={lng}
        />
      </Modal>
      <Modal dialogId={deleteConfDialogId} title="Zmazat konferenciu">
        <DeleteConferenceForm
          dialogId={deleteConfDialogId}
          conference={conference}
          lng={lng}
        />
      </Modal>
    </div>
  );
}
