import { redirect } from "next/navigation";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { capitalizeFirstLetter } from "@/utils/helpers";
import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import { translate } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import DeleteSubmissionForm from "./DeleteSubmissionForm";
import SubmissionForm from "./SubmissionForm";

export default async function AttendeeSubmissionsPage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const { t } = await translate(lng, ["common", "conferences"]);

  const conference = await getConference(slug);
  if (conference && !conference.attending?.ticket.withSubmission) {
    redirect(`/${slug}`);
  }

  const newSubmissionDialogId = "new-submission";
  const updateSubmissionDialogId = "update-submission";
  const deleteSubmissionDialogId = "delete-submission";

  return (
    <div>
      {conference.dates.submissionDeadline &&
        new Date(conference.dates.submissionDeadline) > new Date() && (
          <ModalTrigger dialogId={newSubmissionDialogId}>
            <Button variant="positive">
              <PlusIcon className="w-5 h-5 stroke-2" />
              {t("new")}
            </Button>
          </ModalTrigger>
        )}
      <div className="mt-4 flex flex-col gap-4">
        {conference?.attending?.submissions.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border dark:border-gray-700 p-4 shadow text-gray-900 text-sm focus:outline-primary-500 dark:text-white bg-white dark:bg-gray-700"
          >
            <h2 className="font-medium leading-6">
              {capitalizeFirstLetter(s.translations[lng as "sk" | "en"].name)}
            </h2>
            <p className="leading-none text-gray-500 dark:text-gray-300">
              {s.section.translations[lng as "sk" | "en"].name}
            </p>
            <ul className="mt-2 flex gap-1">
              {s.authors.map((a) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
            <p>{s.translations[lng as "sk" | "en"].abstract}</p>
            <p>{s.translations[lng as "sk" | "en"].keywords.join(" • ")}</p>
            {conference.dates.submissionDeadline &&
              new Date(conference.dates.submissionDeadline) > new Date() && (
                <div className="mt-4 flex gap-2">
                  <Tooltip
                    position="below"
                    message={t("editSubmission", { ns: "conferences" })}
                  >
                    <ModalTrigger
                      dialogId={`${updateSubmissionDialogId}-${s.id}`}
                    >
                      <Button size="icon">
                        <PencilIcon className="size-4 stroke-2" />
                      </Button>
                    </ModalTrigger>
                  </Tooltip>

                  <ModalTrigger
                    dialogId={`${deleteSubmissionDialogId}-${s.id}`}
                  >
                    <Button size="icon" variant="destructive">
                      <TrashIcon className="size-4 stroke-2" />
                    </Button>
                  </ModalTrigger>

                  <Modal
                    dialogId={`${updateSubmissionDialogId}-${s.id}`}
                    title={t("submission.update")}
                  >
                    <SubmissionForm
                      dialogId={`${updateSubmissionDialogId}-${s.id}`}
                      lng={lng}
                      submission={s}
                      conference={conference}
                    />
                  </Modal>
                  <Modal
                    dialogId={`${deleteSubmissionDialogId}-${s.id}`}
                    title={t("submission.delete")}
                  >
                    <DeleteSubmissionForm
                      dialogId={`${deleteSubmissionDialogId}-${s.id}`}
                      lng={lng}
                      submission={s}
                    />
                  </Modal>
                </div>
              )}
          </div>
        ))}
      </div>

      <Modal dialogId={newSubmissionDialogId} title={t("submission.new")}>
        <SubmissionForm
          lng={lng}
          dialogId={newSubmissionDialogId}
          conference={conference}
        />
      </Modal>
    </div>
  );
}
