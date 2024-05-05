"use client";

import { useContext, useTransition } from "react";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { deleteSubmission } from "./actions";

export default function DeleteSubmissionForm({
  submission,
  lng,
}: {
  submission: SubmissionFragment;
  lng: string;
}) {
  const router = useRouter();

  const { dispatch } = useContext(MessageContext);

  const { t } = useTranslation(lng, "common");

  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const state = await deleteSubmission(submission.id);

      if (state.message && !state.success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: state,
        });
      }

      if (state.success) {
        dispatch({
          type: ActionTypes.SetAppMsg,
          payload: state,
        });
        router.back();
      }
    });
  }

  return (
    <div className="space-y-6 text-center">
      <h1>
        {t("deleteConfirm", {
          name: submission.translations[lng as "sk" | "en"]?.name,
        })}
      </h1>

      <Button
        color="primary"
        type="button"
        fluid
        onClick={handleClick}
        disabled={pending}
        loading={pending}
      >
        {t("confirm")}
      </Button>
    </div>
  );
}
