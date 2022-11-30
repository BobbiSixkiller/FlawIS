import { createContext, ReactNode, useState } from "react";
import { Button, Modal } from "semantic-ui-react";

interface DialogState {
  content: ReactNode;
  confirmCb?: () => null;
  cancelCb?: () => null;
  trigger?: ReactNode;
  header?: string;
  canceltext?: string;
  confirmText?: string;
  size?: "small" | "mini" | "tiny" | "large" | "fullscreen" | undefined;
  basic?: boolean;
}

interface DialogContextProps {
  state: DialogState;
  handleOpen: (val: DialogState) => void;
}

export const DialogContext = createContext<DialogContextProps>({
  state: { content: null },
  handleOpen: () => null,
});

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<DialogState>({ content: null });

  const handleOpen = (values: DialogState) => {
    setValues(values);
    setOpen(true);
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
    <DialogContext.Provider value={{ state: values, handleOpen }}>
      <Modal open={open} trigger={values.trigger} size={values.size}>
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
