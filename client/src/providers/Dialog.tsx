import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Button, Message, Modal } from "semantic-ui-react";
import { AuthContext } from "./Auth";

interface DialogState {
  content: ReactNode;
  confirmCb?: () => Promise<void> | void;
  cancelCb?: () => void;
  header?: string;
  cancelText?: string;
  confirmText?: string;
  size?: "small" | "mini" | "tiny" | "large" | "fullscreen" | undefined;
  basic?: boolean;
}

interface DialogContextProps {
  state: DialogState;
  handleOpen: (val: DialogState) => void;
  handleClose: () => void;
  setError: (msg: string) => void;
}

export const DialogContext = createContext<DialogContextProps>({
  state: { content: null },
  handleOpen: () => null,
  handleClose: () => null,
  setError: () => null,
});

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<DialogState>({ content: null });
  const { loading: userloading } = useContext(AuthContext);

  const handleOpen = useCallback((values: DialogState) => {
    setValues(values);
    setError("");
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = useCallback(async () => {
    if (values.confirmCb) {
      setLoading(true);
      await values.confirmCb();
      setLoading(false);
    }
  }, [values]);

  const handleCancel = () => {
    if (values.cancelCb) {
      values.cancelCb();
    }
    setOpen(false);
  };

  return (
    <DialogContext.Provider
      value={{ state: values, handleOpen, handleClose, setError }}
    >
      <Modal
        open={!userloading && open}
        // onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        size={values.size}
      >
        {values.header && <Modal.Header>{values.header}</Modal.Header>}
        <Modal.Content>
          {values.content}
          {error && (
            <Message error content={error} onDismiss={() => setError("")} />
          )}
        </Modal.Content>
        {values.confirmCb && (
          <Modal.Actions>
            <Button onClick={handleCancel}>{values.cancelText}</Button>
            <Button onClick={handleConfirm} positive loading={loading}>
              {values.confirmText}
            </Button>
          </Modal.Actions>
        )}
      </Modal>

      {children}
    </DialogContext.Provider>
  );
}
