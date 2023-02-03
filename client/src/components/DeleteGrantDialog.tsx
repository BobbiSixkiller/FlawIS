import { useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import {
	GrantsDocument,
	useDeleteGrantMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteGrantDialog({ id }: { id: string }) {
	const { handleOpen, handleClose, displayError } = useContext(DialogContext);
	const [deleteGrant, { error }] = useDeleteGrantMutation({
		onCompleted: () => handleClose(),
		refetchQueries: [{ query: GrantsDocument }, "grants"],
	});

	useEffect(() => displayError(error?.message || ""), [error, displayError]);

	return (
		<Button
			negative
			size="tiny"
			icon="trash"
			onClick={() =>
				handleOpen({
					content: <p>Naozaj chcete zmazať vybraný grant?</p>,
					size: "tiny",
					header: "Zmazať grant",
					canceltext: "Zrušiť",
					confirmText: "Potvrdiť",
					confirmCb: async () =>
						(await deleteGrant({ variables: { id } })) as Promise<void>,
				})
			}
		/>
	);
}
