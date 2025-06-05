import { getUser } from "../actions";
import Heading from "@/components/Heading";
import Toggle from "@/components/Toggle";
import { redirect } from "next/navigation";
import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { toggleVerified } from "./actions";
import { translate } from "@/lib/i18n";
import ModalTrigger from "@/components/ModalTrigger";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import UserForm from "@/app/[lng]/(auth)/register/UserForm";
import DeleteUserForm from "./DeleteUserForm";
import ImpersonateForm from "./ImpersonateForm";

export default async function User({
  params: { id, lng },
}: {
  params: { lng: string; id: string };
}) {
  const user = await getUser(id);
  if (!user) {
    redirect("/users");
  }

  const { t } = await translate(lng, ["profile", "common"]);

  const updateUserDialogId = "update-user";
  const deleteUserDialogId = "delete-user";
  const impersonateDialogId = "impersonate-user";

  return (
    <div>
      <Heading
        lng={lng}
        heading={user.name}
        links={[
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={impersonateDialogId}>
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
              <ModalTrigger dialogId={updateUserDialogId}>
                <Button variant="secondary" size="sm">
                  <PencilIcon className="size-5" />
                  Aktualizovat
                </Button>
              </ModalTrigger>
            ),
          },
          {
            type: "custom",
            element: (
              <ModalTrigger dialogId={deleteUserDialogId}>
                <Button variant="secondary" size="sm">
                  <TrashIcon className="size-5" />
                  Zmazat
                </Button>
              </ModalTrigger>
            ),
          },
        ]}
      />
      <div className="mt-6 border-t border-gray-100 dark:border-gray-700">
        <dl className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("name")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user.name}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user.email}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("org")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user.organization || "N/A"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("phone")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user.telephone || "N/A"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("access")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0 flex flex-col gap-1">
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
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
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
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("studyProgramme")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user.studyProgramme ? t(user.studyProgramme) : "N/A"}
            </dd>
          </div>
          <div className="py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              {t("cv")}
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:col-span-2 sm:mt-0">
              {user?.cvUrl ? (
                <Link
                  href={`/minio?bucketName=resumes&url=${user.cvUrl}`}
                  className="text-primary-500 hover:underline"
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
        <DeleteUserForm lng={lng} user={user} />
      </Modal>
      <Modal title="Impersonovat pouzivatela" dialogId={impersonateDialogId}>
        <ImpersonateForm lng={lng} user={user} dialogId={impersonateDialogId} />
      </Modal>
    </div>
  );
}
