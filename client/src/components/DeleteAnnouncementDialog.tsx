import { useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import { useDeleteAnnouncementMutation } from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteAnnouncementDialog({ id }: { id: string }) {
	const { handleOpen, displayError } = useContext(DialogContext);
	const [deleteAnnouncement, { error }] = useDeleteAnnouncementMutation();

	useEffect(() => displayError(error?.message || ""), [error, displayError]);

	return (
		<Button
			negative
			size="tiny"
			icon="trash"
			onClick={() =>
				handleOpen({
					content: <p>Naozaj chcete zmazať oznam?</p>,
					size: "tiny",
					header: "Zmazať oznam",
					canceltext: "Zrušiť",
					confirmText: "Potvrdiť",
					confirmCb: async () =>
						(await deleteAnnouncement({
							variables: { id },
						})) as Promise<void>,
				})
			}
		/>
	);
}
