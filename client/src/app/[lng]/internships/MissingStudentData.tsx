"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Access, UserFragment } from "@/lib/graphql/generated/graphql";
import Modal from "@/components/Modal";
import UserForm from "../(auth)/register/UserForm";
import { useTranslation } from "@/lib/i18n/client";
import { useDialog } from "@/providers/DialogProvider";

export default function MissingStudentData({
  subdomain,
  user,
}: {
  subdomain: string;
  user: UserFragment;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "profile");

  const dialogId = "missiong-student-info";

  const { openDialog, closeDialog } = useDialog();

  useEffect(() => {
    if (
      (!user?.cvUrl ||
        !user?.studyProgramme ||
        !user.telephone ||
        !user.address) &&
      user.verified &&
      user.access.includes(Access.Student)
    ) {
      openDialog(dialogId);
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
