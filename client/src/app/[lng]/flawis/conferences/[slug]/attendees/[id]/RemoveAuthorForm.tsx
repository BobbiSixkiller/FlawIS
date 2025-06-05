"use client";

import Button from "@/components/Button";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";

import { useParams } from "next/navigation";
import { useContext, useTransition } from "react";
import { removeAuthor } from "./actions";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { FormMessage } from "@/components/Message";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";

export default function RemoveAuthor({
  author,
  submission,
  dialogId,
}: {
  submission: SubmissionFragment;
  author: { name: string; email: string; id: string };
  dialogId: string;
}) {
  const { lng, slug, id } = useParams<{
    lng: string;
    slug: string;
    id: string;
  }>();

  const [pending, startTransition] = useTransition();

  const { dispatch } = useContext(MessageContext);

  const { closeDialog } = useDialogStore();

  function handleClick() {
    startTransition(async () => {
      const { message, success } = await removeAuthor(
        submission.id,
        author.id,
        { slug, id }
      );
      if (!success) {
        dispatch({
          type: ActionTypes.SetFormMsg,
          payload: { message, success },
        });
      }

      if (success) {
        dispatch({
          type: ActionTypes.SetAppMsg,
          payload: { message, success },
        });

        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6">
      <FormMessage />

      <p>
        Naozaj chcete zmazat {author.name} ako autora prispevku{" "}
        {submission.translations[lng as "sk" | "en"].name} ?
      </p>

      <Button
        color="red"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? <Spinner inverted /> : "Potvrdit"}
      </Button>
    </div>
  );
}
