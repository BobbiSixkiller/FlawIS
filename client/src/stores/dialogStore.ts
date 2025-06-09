import { create } from "zustand";

interface DialogState {
  openDialogs: Record<string, boolean>;
  openDialog: (id: string) => void;
  closeDialog: (id: string) => void;
  isDialogOpen: (id: string) => boolean;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  openDialogs: {},
  openDialog: (id) =>
    set((state) => ({
      openDialogs: { ...state.openDialogs, [id]: true },
    })),
  closeDialog: (id) =>
    set((state) => ({
      openDialogs: { ...state.openDialogs, [id]: false },
    })),
  isDialogOpen: (id) => !!get().openDialogs[id],
}));
