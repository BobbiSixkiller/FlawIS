import { ApolloError } from "@apollo/client";
import { ReactNode, useContext, useEffect } from "react";
import { Button } from "semantic-ui-react";
import {
	AnnouncementEdge,
	useDeleteAnnouncementMutation,
} from "../graphql/generated/schema";
import { DialogContext } from "../providers/Dialog";

export default function DeleteDialog({
	confirmCb,
	error,
	header,
	content,
	confirmText,
	cancelText,
}: {
	confirmCb: () => void | Promise<void>;
	error: ApolloError | undefined;
	header: string;
	content: ReactNode;
	confirmText: string;
	cancelText: string;
}) {
	const { handleOpen, displayError } = useContext(DialogContext);

	useEffect(() => displayError(error?.message || ""), [error, displayError]);

	return (
		<Button
			negative
			size="tiny"
			icon="trash"
			onClick={() =>
				handleOpen({
					size: "tiny",
					content,
					header,
					cancelText,
					confirmText,
					confirmCb,
				})
			}
		/>
	);
}
