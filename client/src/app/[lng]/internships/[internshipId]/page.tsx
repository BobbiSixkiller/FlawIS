import Link from "next/link";
import { deleteIntern, deleteInternship, getInternship } from "./actions";
import { notFound } from "next/navigation";
import { Status } from "@/lib/graphql/generated/graphql";
import { Application } from "./Application";
import BackButton from "@/components/BackButton";
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
import ApplicationForm from "./ApplicationForm";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { getOptionalViewer } from "@/lib/optionalViewer";
import {
  getInternshipAccess,
  isObjectId,
} from "@/lib/internshipAccess";
import { loginHref, logoutHref } from "@/lib/authRedirect";
import { cookies } from "next/headers";

export default async function InternshipPage({
  params,
}: {
  params: Promise<{ internshipId: string; lng: string }>;
}) {
  const { internshipId, lng } = await params;

  if (!isObjectId(internshipId)) {
    notFound();
  }

  const [internship, user, cookieStore] = await Promise.all([
    getInternship(internshipId),
    getOptionalViewer(),
    cookies(),
  ]);
  if (!internship) {
    notFound();
  }

  const access = getInternshipAccess(user, internship.user);
  const detailHref = `/${internshipId}`;
  const signInHref = cookieStore.get("accessToken")?.value
    ? logoutHref(loginHref(detailHref))
    : loginHref(detailHref);

  const updateInternshipDialogId = "update-internship";
  const deleteInternshipDialogId = "delete-internship";
  const applicationDialogId = "application";
  const deleteApplicationDialogId = "delete-application";

  const { t } = await translate(lng, "internships");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {access.canManage && (
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

        <BackButton fallbackHref="/" label={t("back")} />
      </div>

      <div
        className="prose prose-a:no-underline"
        dangerouslySetInnerHTML={{ __html: internship.description }}
      />

      <p className="text-sm text-gray-500 dark:text-gray-300">
        {t("applicationsCount", { count: internship.applicationsCount })}
      </p>

      {access.canApply && user ? (
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
              {t("checkProfile.prefix")} {" "}
              <Link
                className="font-semibold hover:underline"
                href={"/profile/update"}
                scroll={false}
              >
                {t("checkProfile.link")}
              </Link>
              {t("checkProfile.suffix")}
            </div>

            <ModalTrigger dialogId={applicationDialogId}>
              <Button className="w-full">
                <InboxArrowDownIcon className="size-5 stroke-2 mr-2" />
                {t("apply")}
              </Button>
            </ModalTrigger>
          </>
        )
      ) : !user ? (
        <Button
          as={Link}
          href={signInHref}
          className="w-full"
        >
          <InboxArrowDownIcon className="size-5 stroke-2 mr-2" />
          {t("signInToApply")}
        </Button>
      ) : null}

      {access.canManage ? (
        <>
          <Modal dialogId={updateInternshipDialogId} title={t("update")}>
            <InternshipForm
              dialogId={updateInternshipDialogId}
              data={internship}
            />
          </Modal>
          <Modal
            dialogId={deleteInternshipDialogId}
            title={t("delete.title")}
          >
            <ConfirmDeleteForm
              dialogId={deleteInternshipDialogId}
              text={t("delete.text")}
              action={async () => {
                "use server";
                return deleteInternship(internship.id);
              }}
            />
          </Modal>
        </>
      ) : null}

      {access.canApply && user ? (
        <Modal dialogId={applicationDialogId} title={t("docs")}>
          <ApplicationForm
            dialogId={applicationDialogId}
            user={user}
            application={internship.myApplication}
          />
        </Modal>
      ) : null}

      {access.canApply && internship.myApplication ? (
        <Modal
          dialogId={deleteApplicationDialogId}
          title={t("deleteIntern.title")}
        >
          <ConfirmDeleteForm
            dialogId={deleteApplicationDialogId}
            text={t("deleteIntern.text")}
            action={async () => {
              "use server";
              return deleteIntern(internship.myApplication!.id);
            }}
          />
        </Modal>
      ) : null}
    </div>
  );
}
