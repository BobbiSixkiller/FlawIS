import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import { getConference } from "../actions";
import Heading from "@/components/heading";
import Icon from "@/components/icon";
import { displayDate } from "@/lib/utilsClient";
import DynamicImage from "@/components/dynamic-image";
import ModalTrigger from "@/components/modal-trigger";
import Modal from "@/components/modal";
import UpdateDatesForm from "./update-dates-form";
import { redirect } from "next/navigation";
import ConfirmDeleteForm from "@/components/confirm-delete-form";
import { deleteConference } from "./actions";

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ slug: string; lng: string }>;
}) {
  const { lng, slug } = await params;
  const conference = await getConference(slug);
  if (!conference) {
    redirect("/conferences");
  }

  const updateDatesDialogId = "update-dates";
  const deleteConfDialogId = "delete-conference";

  return (
    <div className="text-foreground dark:text-foreground flex flex-col gap-6">
      <BreadcrumbLabel
        param="slug"
        value={slug}
        path={`/flawis/conferences/${encodeURIComponent(slug)}`}
        label={conference.translations[lng === "en" ? "en" : "sk"].name}
      />
      <div className="flex flex-col gap-4">
        <DynamicImage
          alt="conference-logo"
          src={conference!.translations[lng as "sk" | "en"].logoUrl as string}
          className="w-[300px] h-[150px]"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
        />

        <Heading
          lng={lng}
          heading={conference!.slug}
          subHeading={conference!.translations[lng as "sk" | "en"].name}
          items={[
            <ModalTrigger key={0} dialogId={updateDatesDialogId} size="sm">
              <Icon name="pencil" className="size-5" />
              Aktualizovat
            </ModalTrigger>,
            <ModalTrigger
              key={1}
              dialogId={deleteConfDialogId}
              size="sm"
              variant="secondary"
            >
              <Icon name="trash" className="size-5" />
              Zmazat
            </ModalTrigger>,
          ]}
        />
      </div>

      <div className="border-t border-border dark:border-border">
        <dl className="divide-y divide-border dark:divide-border">
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              Zaciatok
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.start)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              Koniec
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.end)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              Koniec registracie
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.regEnd)}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              Deadline zaslania prispevkov
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {displayDate(conference.dates.submissionDeadline)}
            </dd>
          </div>
        </dl>
      </div>

      <Modal dialogId={updateDatesDialogId} title="Aktualizovat datumy">
        <UpdateDatesForm
          dialogId={updateDatesDialogId}
          conference={conference}
        />
      </Modal>
      <Modal dialogId={deleteConfDialogId} title="Zmazat konferenciu">
        <ConfirmDeleteForm
          dialogId={deleteConfDialogId}
          text={`Naozaj si prajete zmazat konferenciu: ${
            conference.translations[lng as "sk" | "en"].name
          } ?`}
          action={async () => {
            "use server";
            return deleteConference({ id: conference.id });
          }}
        />
      </Modal>
    </div>
  );
}
