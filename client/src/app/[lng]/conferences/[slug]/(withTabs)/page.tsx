import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { getConference } from "@/app/[lng]/flawis/conferences/actions";
import Button from "@/components/Button";
import DownloadInvoiceButton from "@/components/DownloadInvoiceButton";
import DynamicImage from "@/components/DynamicImage";
import Modal from "@/components/Modal";
import ModalTrigger from "@/components/ModalTrigger";
import {
  ConferenceQuery,
  InvoiceOwnerType,
  SubmissionFragment,
} from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import { currentTimestamp } from "@/lib/serverTime";
import { conferenceWorkspaceState } from "@/lib/conferenceWorkspace";
import { capitalizeFirstLetter } from "@/utils/helpers";
import DeleteSubmissionForm from "./submissions/DeleteSubmissionForm";
import SubmissionForm from "./submissions/SubmissionForm";

type Conference = ConferenceQuery["conference"];

function dateFormatter(lng: string) {
  return new Intl.DateTimeFormat(lng === "en" ? "en-GB" : "sk-SK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Bratislava",
  });
}

function SubmissionCard({
  conference,
  editable,
  lng,
  submission,
  t,
}: {
  conference: Conference;
  editable: boolean;
  lng: string;
  submission: SubmissionFragment;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const translation = submission.translations[lng === "en" ? "en" : "sk"];
  const section = submission.section.translations[lng === "en" ? "en" : "sk"];
  const updateDialogId = `update-submission-${submission.id}`;
  const deleteDialogId = `delete-submission-${submission.id}`;

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-300">
            {section.name}
          </p>
          <h3 className="mt-1 text-lg font-medium text-gray-950 dark:text-white">
            {capitalizeFirstLetter(translation.name)}
          </h3>
        </div>

        {editable ? (
          <div className="flex shrink-0 gap-1">
            <ModalTrigger dialogId={updateDialogId}>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("workspace.editSubmission")}
              >
                <PencilIcon className="size-4" />
              </Button>
            </ModalTrigger>
            <ModalTrigger dialogId={deleteDialogId}>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-300"
                aria-label={t("workspace.deleteSubmission")}
              >
                <TrashIcon className="size-4" />
              </Button>
            </ModalTrigger>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
        {translation.abstract}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {translation.keywords.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-950 dark:text-primary-200"
          >
            {keyword}
          </span>
        ))}
      </div>

      <dl className="mt-4 space-y-2 border-t pt-4 text-sm dark:border-gray-700">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500 dark:text-gray-400">
            {t("workspace.authors")}
          </dt>
          <dd className="text-right text-gray-800 dark:text-gray-200">
            {submission.authors.map((author) => author.name).join(", ")}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500 dark:text-gray-400">
            {t("workspace.presentationLanguage")}
          </dt>
          <dd className="text-gray-800 dark:text-gray-200">
            {submission.presentationLng || "—"}
          </dd>
        </div>
      </dl>

      {submission.fileUrl ? (
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-300"
        >
          <ArrowDownTrayIcon className="size-4" />
          {t("workspace.downloadFile")}
        </a>
      ) : (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          {t("workspace.fileMissing")}
        </p>
      )}

      {editable ? (
        <>
          <Modal dialogId={updateDialogId} title={t("submission.update")}>
            <SubmissionForm
              dialogId={updateDialogId}
              lng={lng}
              submission={submission}
              conference={conference}
            />
          </Modal>
          <Modal dialogId={deleteDialogId} title={t("submission.delete")}>
            <DeleteSubmissionForm
              dialogId={deleteDialogId}
              lng={lng}
              submission={submission}
            />
          </Modal>
        </>
      ) : null}
    </article>
  );
}

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const [{ t }, conference] = await Promise.all([
    translate(lng, ["conferences", "common"]),
    getConference(slug),
  ]);
  const locale = lng === "en" ? "en" : "sk";
  const translation = conference.translations[locale];
  const formatter = dateFormatter(lng);
  const now = currentTimestamp();
  const state = conferenceWorkspaceState(
    conference.dates,
    Boolean(conference.attending?.ticket.withSubmission),
    now,
  );
  const registrationEnd = conference.dates.regEnd
    ? new Date(conference.dates.regEnd)
    : undefined;
  const submissionDeadline = conference.dates.submissionDeadline
    ? new Date(conference.dates.submissionDeadline)
    : undefined;
  const newSubmissionDialogId = "new-submission";

  const timeline = [
    registrationEnd
      ? {
          key: "registration",
          label: t("conference.regEnd"),
          value: registrationEnd,
        }
      : null,
    submissionDeadline
      ? {
          key: "submission",
          label: t("conference.submissionDeadline"),
          value: submissionDeadline,
        }
      : null,
    {
      key: "start",
      label: t("conference.start"),
      value: new Date(conference.dates.start),
    },
    {
      key: "end",
      label: t("conference.end"),
      value: new Date(conference.dates.end),
    },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="flex flex-col gap-6 text-gray-950 dark:text-white/90">
      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex min-h-44 items-center justify-center border-b bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <DynamicImage
            alt={translation.name}
            src={translation.logoUrl || "/images/img-placeholder.jpg"}
            className="h-32 w-full"
            fill
            sizes="(max-width: 640px) calc(100vw - 4rem), 28rem"
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-200">
              {t(`workspace.status.${state.eventState}`)}
            </span>
            {conference.attending ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                {t("workspace.registered")}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
            {conference.slug}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight">
            {translation.name}
          </h1>
        </div>
      </section>

      <section
        aria-labelledby="timeline-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-primary-600 dark:text-primary-300" />
          <h2 id="timeline-heading" className="text-lg font-semibold">
            {t("workspace.importantDates")}
          </h2>
        </div>
        <ol className="ml-2 mt-5 border-l border-primary-200 dark:border-primary-800">
          {timeline.map((item) => (
            <li key={item.key} className="relative pb-5 pl-6 last:pb-0">
              <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800 dark:bg-primary-300" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <time
                dateTime={item.value.toISOString()}
                className="mt-0.5 block font-medium text-gray-900 dark:text-gray-100"
              >
                {formatter.format(item.value)}
              </time>
            </li>
          ))}
        </ol>
      </section>

      {conference.attending ? (
        <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            {conference.attending.ticket.online ? (
              <ComputerDesktopIcon className="size-5 text-primary-600 dark:text-primary-300" />
            ) : (
              <MapPinIcon className="size-5 text-primary-600 dark:text-primary-300" />
            )}
            <h2 className="text-lg font-semibold">
              {t("workspace.participation")}
            </h2>
          </div>
          <p className="mt-3 font-medium">
            {conference.attending.ticket.translations[locale].name}
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {conference.attending.ticket.translations[locale].description}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {conference.attending.ticket.online
              ? t("workspace.online")
              : t("workspace.inPerson")}
          </p>
          {conference.attending.hasInvoice ? (
            <div className="mt-4 border-t pt-4 dark:border-gray-700">
              <DownloadInvoiceButton
                attendeeId={conference.attending.id}
                lng={lng}
                ownerType={InvoiceOwnerType.ConferenceAttendee}
              />
            </div>
          ) : null}
        </section>
      ) : state.registrationOpen ? (
        <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-800 dark:bg-primary-950">
          <h2 className="text-lg font-semibold">
            {t("workspace.registrationOpen")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {t("workspace.registrationOpenDescription")}
          </p>
          <Button as={Link} href={`/${slug}/register`} className="mt-4 w-full">
            {t("workspace.register")}
          </Button>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
          <h2 className="font-semibold text-amber-900 dark:text-amber-100">
            {t("workspace.registrationClosed")}
          </h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            {t("workspace.registrationClosedDescription")}
          </p>
        </section>
      )}

      {conference.attending?.ticket.withSubmission ? (
        <section id="submissions" className="scroll-mt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="size-5 text-primary-600 dark:text-primary-300" />
                <h2 className="text-xl font-semibold">
                  {t("workspace.mySubmissions")}
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {state.submissionsEditable
                  ? t("workspace.submissionsEditable")
                  : t("workspace.submissionsReadOnly")}
              </p>
            </div>
            {state.submissionsEditable ? (
              <ModalTrigger dialogId={newSubmissionDialogId}>
                <Button size="sm">
                  <PlusIcon className="size-4" />
                  {t("workspace.addSubmission")}
                </Button>
              </ModalTrigger>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {conference.attending.submissions.length > 0 ? (
              conference.attending.submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  conference={conference}
                  editable={state.submissionsEditable}
                  lng={lng}
                  submission={submission}
                  t={t}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {state.submissionsEditable
                  ? t("workspace.noSubmissionsEditable")
                  : t("workspace.noSubmissions")}
              </div>
            )}
          </div>

          {state.submissionsEditable ? (
            <Modal
              dialogId={newSubmissionDialogId}
              title={t("submission.new")}
            >
              <SubmissionForm
                lng={lng}
                dialogId={newSubmissionDialogId}
                conference={conference}
              />
            </Modal>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
