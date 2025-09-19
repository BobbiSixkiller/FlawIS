"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Access, UserFragment } from "@/lib/graphql/generated/graphql";
import Modal from "@/components/Modal";
import UserForm from "../(auth)/register/UserForm";
import { useTranslation } from "@/lib/i18n/client";
import { useDialogStore } from "@/stores/dialogStore";

export default function MissingStudentDataDialog({
  subdomain,
  user,
}: {
  subdomain: string;
  user: UserFragment;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "profile");

  const dialogId = "missiong-student-info";

  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  useEffect(() => {
    const missingData =
      !user?.cvUrl || !user?.studyProgramme || !user.telephone || !user.address;
    const isStudent = user.verified && user.access.includes(Access.Student);

    if (missingData && isStudent) {
      openDialog(dialogId);
    } else {
      closeDialog(dialogId);
    }
  }, [user]);

  return (
    <Modal title={t("heading")} dialogId={dialogId} togglerHidden>
      <UserForm
        user={user}
        namespace="profile"
        dialogId={dialogId}
        subdomain={subdomain}
      />
    </Modal>
  );
}
