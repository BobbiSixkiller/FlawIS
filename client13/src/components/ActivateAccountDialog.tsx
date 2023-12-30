"use client";

import Modal from "./Modal";
import { useEffect, useState } from "react";
import { User } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import Button from "./Button";
import { activate, resendActivationLink } from "@/app/[lng]/(auth)/actions";
import { useFormState } from "react-dom";
import Message from "./Message";

export default function ActivateAccountDialog({
  lng,
  user,
}: {
  lng: string;
  user?: Omit<User, "grants">;
}) {
  const [state, action] = useFormState(resendActivationLink, {
    success: false,
    message: "",
  });
  const [open, setOpen] = useState(user && !user?.verified);
  const [activationState, setActivationState] = useState({
    success: false,
    message: "",
  });

  const { t } = useTranslation(lng, "activateAccount");

  useEffect(() => {
    async function activateCb() {
      const res = await activate();
      if (res) {
        setActivationState(res);
      }
    }

    activateCb();
  }, []);

  return (
    <Modal
      isOpen={open || false}
      onClose={() => setOpen(!user?.verified)}
      title={t("heading")}
    >
      <form action={action} className="flex flex-col gap-4">
        {t("body")}
        <Button type="submit">{t("button")}</Button>
        {(state.message || activationState.message) && (
          <Message
            success={state.success || activationState.success}
            message={state.message || activationState.message}
          />
        )}
      </form>
    </Modal>
  );
}
