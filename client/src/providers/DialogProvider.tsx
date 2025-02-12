// DialogProvider.tsx
"use client";

import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useCallback,
} from "react";

// Define the shape of the context
interface DialogContextType {
  openDialog: (dialogId: string) => void;
  closeDialog: (dialogId: string) => void;
  isDialogOpen: (dialogId: string) => boolean;
  someDialogOpen: boolean;
}

// Create the context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Provider component
export default function DialogProvider({ children }: { children: ReactNode }) {
  const [openDialogs, setOpenDialogs] = useState<Set<string>>(new Set());

  const openDialog = useCallback(
    (dialogId: string) => setOpenDialogs((prev) => new Set(prev).add(dialogId)),
    []
  );

  const closeDialog = (dialogId: string) => {
    setOpenDialogs((prev) => {
      const updated = new Set(prev);
      updated.delete(dialogId);
      return updated;
    });
  };

  console.log(openDialogs);

  const isDialogOpen = (dialogId: string) => openDialogs.has(dialogId);

  const someDialogOpen = openDialogs.size > 0;

  return (
    <DialogContext.Provider
      value={{ openDialog, closeDialog, isDialogOpen, someDialogOpen }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      "This useDialog hook must be used within DialogProvider component!"
    );
  }

  return context;
};
