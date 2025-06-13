import Link from "next/link";
import { getInternship } from "./actions";
import { redirect } from "next/navigation";
import { getMe } from "../../(auth)/actions";
import { Access, Status } from "@/lib/graphql/generated/graphql";
import { Application } from "./Application";
import CloseButton from "@/components/CloseButton";
import ModalTrigger from "@/components/ModalTrigger";
import {
  InboxArrowDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import InternshipForm from "../InternshipForm";
import { translate } from "@/lib/i18n";
import DeleteInternshipForm from "./DeleteInternshipForm";
import DeleteApplicationForm from "./DeleteApplicationForm";
import ApplicationForm from "./ApplicationForm";

export default async function InternshipPage({
  params: { internshipId, lng },
}: {
  params: { internshipId: string; lng: string };
}) {
  const [internship, user] = await Promise.all([
    getInternship(internshipId),
    getMe(),
  ]);
  if (!internship) {
    redirect("/");
  }

  const showControls =
    user.access.includes(Access.Admin) ||
    user.access.includes(Access.Organization);

  const updateInternshipDialogId = "update-internship";
  const deleteInternshipDialogId = "delete-internship";
  const applicationDialogId = "application";
  const deleteApplicationDialogId = "delete-application";

  const { t } = await translate(lng, "internships");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {showControls && (
          <>
            <ModalTrigger dialogId={updateInternshipDialogId}>
              <Button size="icon" className="rounded-full">
                <PencilIcon className="size-5" />
              </Button>
            </ModalTrigger>
            <ModalTrigger dialogId={deleteInternshipDialogId}>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
              >
                <TrashIcon className="size-5" />
              </Button>
            </ModalTrigger>
          </>
        )}

        <CloseButton />
      </div>

      <div
        className="prose prose-a:no-underline"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />

      {user.access.includes(Access.Student) ? (
        internship.myApplication ? (
          <>
            <div className="border-t dark:border-gray-600" />
            <Application
              lng={lng}
              application={internship.myApplication}
              controls={
                <div className="flex gap-2">
                  {internship.myApplication.status === Status.Applied && (
                    <ModalTrigger dialogId={applicationDialogId}>
                      <Button size="icon">
                        <PencilIcon className="size-5" />
                      </Button>
                    </ModalTrigger>
                  )}

                  {internship.myApplication.status !== Status.Accepted && (
                    <ModalTrigger dialogId={deleteApplicationDialogId}>
                      <Button size="icon" variant="destructive">
                        <TrashIcon className="size-5" />
                      </Button>
                    </ModalTrigger>
                  )}
                </div>
              }
            />
          </>
        ) : (
          <>
            <div className="text-center rounded-lg p-4 border border-orange-300 bg-orange-100 text-orange-500  dark:border-orange-500 dark:bg-orange-300 dark:text-orange-700">
              Pred prihlasenim si prosim skontrolujte{" "}
              <Link
                className="font-semibold hover:underline"
                href={"/profile/update"}
                scroll={false}
              >
                osobne udaje
              </Link>
              .
            </div>

            <ModalTrigger dialogId={applicationDialogId}>
              <Button className="w-full">
                <InboxArrowDownIcon className="size-5 stroke-2 mr-2" />
                {t("apply")}
              </Button>
            </ModalTrigger>
          </>
        )
      ) : null}

      <Modal dialogId={updateInternshipDialogId} title={t("update")}>
        <InternshipForm dialogId={updateInternshipDialogId} data={internship} />
      </Modal>
      <Modal dialogId={deleteInternshipDialogId} title={t("delete.title")}>
        <DeleteInternshipForm dialogId={deleteInternshipDialogId} />
      </Modal>
      <Modal
        dialogId={deleteApplicationDialogId}
        title={t("deleteIntern.title")}
      >
        <DeleteApplicationForm
          dialogId={deleteApplicationDialogId}
          internId={internship.myApplication?.id}
        />
      </Modal>
      <Modal dialogId={applicationDialogId} title={t("docs")}>
        <ApplicationForm
          dialogId={applicationDialogId}
          user={user}
          application={internship.myApplication}
        />
      </Modal>
    </div>
  );
}
