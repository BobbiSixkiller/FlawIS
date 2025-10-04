import Heading from "@/components/Heading";
import DownloadPDFButton from "./DownloadPDFButton";
import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { redirect } from "next/navigation";
import { capitalizeFirstLetter, cn } from "@/utils/helpers";
import RemoveAuthorForm from "./RemoveAuthorForm";
import { deleteAttendee, getAttendee } from "./actions";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ImpersonateForm from "@/app/[lng]/flawis/users/[id]/ImpersonateForm";
import UpdateInvoiceForm from "./InvoiceForm";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";

export default async function AttendeePage({
  params,
}: {
  params: Promise<{ slug: string; id: string; lng: string }>;
}) {
  const { id, lng, slug } = await params;
  const attendee = await getAttendee(id);
  if (!attendee) {
    redirect(`/conferences/${slug}/attendees`);
  }

  const deleteDialogId = "delete-attendee";
  const impersonateDialogId = "imperonate-attendee";
  const deleteAuthorDialogId = "delete-author";
  const updateInvoiceDialogId = "update-invoice";

  return (
    <div className="flex flex-col gap-4">
      <CloseButton href={`/conferences/${slug}/attendees`} />

      <Heading
        lng={lng}
        heading={attendee.user.name}
        subHeading={
          attendee.user.__typename === "User"
            ? attendee.user.organization
            : "N/A"
        }
        links={[
          {
            type: "custom",
            element: (
              <ModalTrigger key={0} dialogId={impersonateDialogId}>
                <Button size="sm">
                  <ArrowsRightLeftIcon className="size-5" />
                  Impersonovat
                </Button>
              </ModalTrigger>
            ),
          },
          {
            type: "custom",
            element: (
              <ModalTrigger key={1} dialogId={deleteDialogId}>
                <Button size="sm" variant="secondary">
                  <TrashIcon className="size-5" />
                  Zmazat
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />
      <div className="flex gap-2">
        <DownloadPDFButton lng={lng} data={attendee} />

        <ModalTrigger dialogId={updateInvoiceDialogId}>
          <Button size="icon" variant="ghost">
            <PencilIcon className="w-5 h-5" />
          </Button>
        </ModalTrigger>
      </div>
      {attendee.submissions.length > 0 && (
        <div className="flex flex-col gap-4">
          {attendee.submissions.map((s) => (
            <div
              key={s.id}
              className={cn([
                "rounded-2xl border p-4 shadow text-gray-900 text-sm focus:outline-primary-500 col-span-2 sm:col-span-1",
                "dark:border-gray-700 dark:bg-gray-700 dark:text-white",
              ])}
            >
              <h2 className="font-medium leading-6">
                {capitalizeFirstLetter(s.translations[lng as "sk" | "en"].name)}
              </h2>
              <p className="leading-none text-gray-500">
                {s.section.translations[lng as "sk" | "en"].name}
                <br />
                {s.id}
              </p>
              <ul className="mt-2 flex gap-1">
                {s.authors.map((a) => (
                  <li key={a.id} className="flex gap-1">
                    {a.name}

                    <ModalTrigger dialogId={`${deleteAuthorDialogId}-${a.id}`}>
                      <Button
                        variant="ghost"
                        className="p-1 h-fit bg-transparent"
                      >
                        <XMarkIcon className="size-3 stroke-2" />
                      </Button>
                    </ModalTrigger>

                    <Modal
                      title="Zmazat autora"
                      dialogId={`${deleteAuthorDialogId}-${a.id}`}
                    >
                      <RemoveAuthorForm
                        dialogId={`${deleteAuthorDialogId}-${a.id}`}
                        author={a}
                        submission={s}
                      />
                    </Modal>
                  </li>
                ))}
              </ul>
              <p>{s.translations[lng as "sk" | "en"].abstract}</p>
              <p>{s.translations[lng as "sk" | "en"].keywords.join(" • ")}</p>
              {attendee.ticket.withSubmission && !s.fileUrl && (
                <p className="text-orange-500">Neodovzdal prispevok</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal dialogId={deleteDialogId} title="Zmazat ucastnika">
        <ConfirmDeleteForm
          dialogId={deleteDialogId}
          text={`Naozaj si prajete zmazat ucastnika: ${attendee.user.name} ?`}
          action={async () => {
            "use server";
            return deleteAttendee(attendee.id);
          }}
        />
      </Modal>
      <Modal dialogId={impersonateDialogId} title="Impersonovat ucastnika">
        <ImpersonateForm
          dialogId={impersonateDialogId}
          lng={lng}
          user={attendee.user}
        />
      </Modal>
      <Modal dialogId={updateInvoiceDialogId} title="Upravit fakturu">
        <UpdateInvoiceForm
          dialogId={updateInvoiceDialogId}
          lng={lng}
          invoice={attendee.invoice}
        />
      </Modal>
    </div>
  );
}

export const dynamic = "force-dynamic";
