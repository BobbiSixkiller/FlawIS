import { useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import {
	useDeleteUserMutation,
	UsersDocument,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteUserDialog({ id }: { id: string }) {
	const { handleOpen, handleClose, displayError } = useContext(DialogContext);
	const [deleteGrant, { error }] = useDeleteUserMutation({
		onCompleted: () => handleClose(),
		refetchQueries: [{ query: UsersDocument }, "users"],
	});

	useEffect(() => displayError(error?.message || ""), [error, displayError]);

	return (
		<Button
			negative
			size="tiny"
			icon="trash"
			onClick={() =>
				handleOpen({
					content: <p>Naozaj chcete zmazať vybraného používateľa?</p>,
					size: "tiny",
					header: "Zmazať používateľa",
					canceltext: "Zrušiť",
					confirmText: "Potvrdiť",
					confirmCb: async () =>
						(await deleteGrant({ variables: { id } })) as Promise<void>,
				})
			}
		/>
	);
}
