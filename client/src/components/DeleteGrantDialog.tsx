import { useContext } from "react";
import { Button } from "semantic-ui-react";
import { DialogContext } from "../providers/Dialog";

export default function DeleteGrantDialog() {
	const { handleOpen } = useContext(DialogContext);

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
					confirmCb: () => console.log("DELETE"),
				})
			}
		/>
	);
}
