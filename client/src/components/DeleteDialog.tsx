import { ReactNode, useContext } from "react";
import { Button } from "semantic-ui-react";

import { DialogContext } from "../providers/Dialog";

export default function DeleteDialog({
	confirmCb,
	header,
	content,
	confirmText,
	cancelText,
}: {
	confirmCb: () => void | Promise<void>;
	header: string;
	content: ReactNode;
	confirmText: string;
	cancelText: string;
}) {
	const { handleOpen, handleClose, setError } = useContext(DialogContext);

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
					confirmCb: async () => {
						try {
							await confirmCb();
							handleClose();
						} catch (error: any) {
							setError(error.message);
						}
					},
				})
			}
		/>
	);
}
