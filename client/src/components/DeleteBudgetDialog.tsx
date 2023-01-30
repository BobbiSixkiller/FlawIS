import { useContext } from "react";
import { Button } from "semantic-ui-react";
import { useDeleteBudgetMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteBudgetDialog({
  id,
  year,
}: {
  id: string;
  year: Date;
}) {
  const { handleOpen, displayError } = useContext(DialogContext);
  const [deleteBudget] = useDeleteBudgetMutation({
    onError: (err) => displayError(err.message),
  });

  return (
    <Button
      negative
      size="tiny"
      icon="trash"
      onClick={() =>
        handleOpen({
          content: <p>Naozaj chcete zmazať vybraný rozpočet?</p>,
          size: "tiny",
          header: "Zmazať rozpočet",
          canceltext: "Zrušiť",
          confirmText: "Potvrdiť",
          confirmCb: async () =>
            (await deleteBudget({ variables: { id, year } })) as Promise<void>,
        })
      }
    />
  );
}
