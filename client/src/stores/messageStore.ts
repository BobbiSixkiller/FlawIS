import { create } from "zustand";

type Message = {
  visible: boolean;
  content: string;
  success: boolean;
};

interface MessageStore {
  message: Message;
  setMessage: (content: string, success: boolean) => void;
  clearMessage: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  message: { visible: false, content: "", success: false },

  setMessage: (content, success) =>
    set(() => ({
      message: { visible: true, content, success },
    })),

  clearMessage: () =>
    set((state) => ({
      message: { ...state.message, visible: false },
    })),
}));
