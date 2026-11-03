import { BreadcrumbLabel } from "@/components/breadcrumb-labels";
import Heading from "@/components/heading";
import Toggle from "@/components/toggle";
import { redirect } from "next/navigation";
import Icon from "@/components/icon";
import Link from "next/link";
import { deleteUser, getUser, toggleVerified } from "./actions";
import { translate } from "@/lib/i18n";
import ModalTrigger from "@/components/modal-trigger";
import Modal from "@/components/modal";
import UserForm from "@/app/[lng]/(auth)/register/user-form";
import ImpersonateForm from "./impersonate-form";
import ConfirmDeleteForm from "@/components/confirm-delete-form";

export default async function User({
  params,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { id, lng } = await params;
  const { t } = await translate(lng, ["profile", "common"]);

  const user = await getUser(id);
  if (!user) {
    redirect("/users");
  }

  const updateUserDialogId = "update-user";
  const deleteUserDialogId = "delete-user";
  const impersonateDialogId = "impersonate-user";

  return (
    <div>
      <BreadcrumbLabel
        param="id"
        value={id}
        path={`/flawis/users/${encodeURIComponent(id)}`}
        label={user.name}
      />
      <Heading
        lng={lng}
        heading={user.name}
        items={[
          <ModalTrigger key={0} dialogId={impersonateDialogId} size="sm">
            <Icon name="arrows-right-left" className="size-5" />
            Impersonovat
          </ModalTrigger>,
          <ModalTrigger
            key={1}
            dialogId={updateUserDialogId}
            variant="secondary"
            size="sm"
          >
            <Icon name="pencil" className="size-5" />
            Aktualizovat
          </ModalTrigger>,

          <ModalTrigger
            key={2}
            dialogId={deleteUserDialogId}
            variant="secondary"
            size="sm"
          >
            <Icon name="trash" className="size-5" />
            Zmazat
          </ModalTrigger>,
        ]}
      />
      <div className="mt-6 border-t border-border dark:border-border">
        <dl className="divide-y divide-border dark:divide-border">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user.name}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user.organization || "N/A"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user.telephone || "N/A"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("access")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0 flex flex-col gap-1">
              {user.access.length > 0 ? (
                <ul>
                  {user.access.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                "N/A"
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 items-center">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("status")}
            </dt>
            <dd
              className={`mt-1 text-sm leading-6 ${
                user.verified ? "text-green-500" : "text-red-500"
              } sm:col-span-2 sm:mt-0 flex justify-between items-center`}
            >
              <span>{user.verified ? "Overeny" : "Neovereny"}</span>
              <Toggle
                defaultChecked={user.verified}
                handleToggle={async () => {
                  "use server";
                  await toggleVerified(user.id, user.verified);
                }}
              />
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("studyProgramme")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user.studyProgramme ? t(user.studyProgramme) : "N/A"}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-foreground dark:text-foreground">
              {t("cv")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-foreground dark:text-muted-foreground sm:col-span-2 sm:mt-0">
              {user?.cvUrl ? (
                <Link
                  href={`/minio?bucketName=resumes&url=${user.cvUrl}`}
                  className="text-primary hover:underline"
                >
                  CV.pdf
                </Link>
              ) : (
                "N/A"
              )}
            </dd>
          </div>
        </dl>
      </div>

      <Modal title="Aktualizovat pouzivatela" dialogId={updateUserDialogId}>
        <UserForm
          namespace="profile"
          dialogId={updateUserDialogId}
          user={user}
        />
      </Modal>
      <Modal title="Zmazat pouzivatela" dialogId={deleteUserDialogId}>
        <ConfirmDeleteForm
          dialogId={deleteUserDialogId}
          text="Naozaj chcete zmazat tohto pouzivatela?"
          action={async () => {
            "use server";
            return deleteUser(user.id);
          }}
        />
      </Modal>
      <Modal title="Impersonovat pouzivatela" dialogId={impersonateDialogId}>
        <ImpersonateForm lng={lng} user={user} dialogId={impersonateDialogId} />
      </Modal>
    </div>
  );
}
