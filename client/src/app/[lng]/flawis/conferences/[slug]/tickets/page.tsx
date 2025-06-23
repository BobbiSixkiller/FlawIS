import Dropdown from "@/components/Dropdown";
import { getConference } from "../../actions";
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import ModalTrigger from "@/components/ModalTrigger";
import Modal from "@/components/Modal";
import DeleteTicketForm from "./DeleteTicketForm";
import { redirect } from "next/navigation";
import TicketForm from "./TicketForm";

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}) {
  const { lng, slug } = await params;
  const conference = await getConference(slug);
  if (!conference) {
    redirect("/conferences");
  }

  const newTicketDialogId = "new-ticket";
  const updateTicketDialogId = (id: string) => `update-ticket-${id}`;
  const deleteTicketDialogId = (id: string) => `delete-ticket-${id}`;

  return (
    <div className="">
      <ModalTrigger dialogId={newTicketDialogId}>
        <Button size="sm">
          <PlusIcon className="h-5 w-5" />
          Novy
        </Button>
      </ModalTrigger>

      <div className="-mx-6 sm:mx-0 divide-y dark:divide-gray-600">
        {conference?.tickets.map((t) => (
          <div
            className="p-6 sm:p-4 flex justify-between gap-4 text-gray-900 dark:text-white"
            key={t.id}
          >
            <div className="flex flex-col">
              <span className="text-lg">
                {t.translations[lng as "sk" | "en"].name}
              </span>
              <span className="text-sm text-gray-400">
                {t.translations[lng as "sk" | "en"].description}
              </span>
            </div>

            <Dropdown
              trigger={
                <Button size="icon" variant="ghost">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </Button>
              }
              items={[
                {
                  type: "custom",
                  element: (
                    <ModalTrigger dialogId={updateTicketDialogId(t.id)}>
                      <Button size="sm">Aktualizovat</Button>
                    </ModalTrigger>
                  ),
                },
                {
                  type: "custom",
                  element: (
                    <ModalTrigger dialogId={deleteTicketDialogId(t.id)}>
                      <Button size="sm">Zmazat</Button>
                    </ModalTrigger>
                  ),
                },
              ]}
            />

            <Modal dialogId={updateTicketDialogId(t.id)} title="Upravit listok">
              <TicketForm
                dialogId={updateTicketDialogId(t.id)}
                lng={lng}
                ticket={t}
              />
            </Modal>
            <Modal dialogId={deleteTicketDialogId(t.id)} title="Zmazat listok">
              <DeleteTicketForm
                dialogId={deleteTicketDialogId(t.id)}
                lng={lng}
                ticket={t}
              />
            </Modal>
          </div>
        ))}
      </div>

      <Modal dialogId={newTicketDialogId} title="Pridat listok">
        <TicketForm dialogId={newTicketDialogId} lng={lng} />
      </Modal>
    </div>
  );
}
