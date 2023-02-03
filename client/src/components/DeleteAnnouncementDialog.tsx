import { useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import {
	AnnouncementEdge,
	AnnouncementsDocument,
	useDeleteAnnouncementMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteAnnouncementDialog({ id }: { id: string }) {
	const { handleOpen, displayError } = useContext(DialogContext);
	const [deleteAnnouncement, { error }] = useDeleteAnnouncementMutation({
		update(cache, { data }) {
			cache.modify({
				fields: {
					announcements(existing) {
						return {
							...existing,
							edges: existing.edges.filter(
								(n: AnnouncementEdge) =>
									n.cursor !== data?.deleteAnnouncement.id
							),
						};
					},
				},
			});
		},
	});

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
					confirmCb: async () => {
						(await deleteAnnouncement({
							variables: { id },
						})) as Promise<void>;
					},
				})
			}
		/>
	);
}
