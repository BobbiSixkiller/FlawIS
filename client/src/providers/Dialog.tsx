import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { Button, Modal } from "semantic-ui-react";
import { AuthContext } from "./Auth";

interface DialogState {
	content: ReactNode;
	confirmCb?: () => null;
	cancelCb?: () => null;
	header?: string;
	canceltext?: string;
	confirmText?: string;
	size?: "small" | "mini" | "tiny" | "large" | "fullscreen" | undefined;
	basic?: boolean;
}

interface DialogContextProps {
	state: DialogState;
	handleOpen: (val: DialogState) => void;
	handleClose: () => void;
}

export const DialogContext = createContext<DialogContextProps>({
	state: { content: null },
	handleOpen: () => null,
	handleClose: () => null,
});

export function DialogProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [values, setValues] = useState<DialogState>({ content: null });
	const { loading } = useContext(AuthContext);

	const handleOpen = useCallback((values: DialogState) => {
		setValues(values);
		setOpen(true);
	}, []);

	const handleClose = () => {
		setOpen(false);
	};

	const handleConfirm = () => {
		if (values.confirmCb) {
			values.confirmCb();
		}
		setOpen(false);
	};

	const handleCancel = () => {
		if (values.cancelCb) {
			values.cancelCb();
		}
		setOpen(false);
	};

	return (
		<DialogContext.Provider value={{ state: values, handleOpen, handleClose }}>
			<Modal
				open={!loading && open}
				onClose={() => setOpen(false)}
				onOpen={() => setOpen(true)}
				size={values.size}
			>
				{values.header && <Modal.Header>{values.header}</Modal.Header>}
				<Modal.Content>{values.content}</Modal.Content>
				{values.confirmCb && (
					<Modal.Actions>
						<Button onClick={handleCancel}>{values.canceltext}</Button>
						<Button onClick={handleConfirm} positive>
							{values.confirmText}
						</Button>
					</Modal.Actions>
				)}
			</Modal>

			{children}
		</DialogContext.Provider>
	);
}
