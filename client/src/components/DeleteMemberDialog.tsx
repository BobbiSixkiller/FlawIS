import { useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { useDeleteMemberMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteMemberDialog({
  id,
  year,
  user,
}: {
  id: string;
  year: Date;
  user: string;
}) {
  const { handleOpen, displayError } = useContext(DialogContext);
  const [deleteMember, { error }] = useDeleteMemberMutation();

  useEffect(() => displayError(error?.message || ""), [error, displayError]);

  return (
    <Button
      negative
      size="tiny"
      icon="trash"
      onClick={() =>
        handleOpen({
          content: <p>Naozaj chcete zmazať riešiteľa?</p>,
          size: "tiny",
          header: "Zmazať rieśiteľa",
          canceltext: "Zrušiť",
          confirmText: "Potvrdiť",
          confirmCb: async () =>
            (await deleteMember({
              variables: { id, year, user },
            })) as Promise<void>,
        })
      }
    />
  );
}
