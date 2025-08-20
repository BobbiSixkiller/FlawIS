"use client";

import Button from "@/components/Button";
import { SubmissionFragment } from "@/lib/graphql/generated/graphql";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { removeAuthor } from "./actions";
import Spinner from "@/components/Spinner";
import { useDialogStore } from "@/stores/dialogStore";
import { useMessageStore } from "@/stores/messageStore";

export default function RemoveAuthor({
  author,
  submission,
  dialogId,
}: {
  submission: SubmissionFragment;
  author: { name: string; email: string; id: string };
  dialogId: string;
}) {
  const { lng } = useParams<{
    lng: string;
    slug: string;
    id: string;
  }>();

  const [pending, startTransition] = useTransition();

  const closeDialog = useDialogStore((s) => s.closeDialog);
  const setMessage = useMessageStore((s) => s.setMessage);

  function handleClick() {
    startTransition(async () => {
      const res = await removeAuthor({
        id: submission.id,
        authorId: author.id,
      });

      setMessage(res.message, res.success);

      if (res.success) {
        closeDialog(dialogId);
      }
    });
  }

  return (
    <div className="space-y-6">
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
