"use client";

import { Dispatch, ReactNode, createContext, useReducer } from "react";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum ActionTypes {
  SetMsg = "SET_MSG",
  ClearMsg = "CLEAR_MSG",
}

type ActionPayload = {
  [ActionTypes.SetMsg]: {
    content: string;
    positive?: boolean;
    dialogOpen?: boolean;
  };
  [ActionTypes.ClearMsg]: undefined;
};

type MessageActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type MessageState = {
  visible: boolean;
  positive?: boolean;
  content?: string;
  dialogOpen?: boolean;
};

export const MessageContext = createContext<
  MessageState & { dispatch: Dispatch<MessageActions> }
>({
  visible: false,
  dispatch: () => null,
});

function messageReducer(state: MessageState, action: MessageActions) {
  switch (action.type) {
    case ActionTypes.SetMsg:
      return {
        ...state,
        visible: true,
        content: action.payload.content,
        positive: action.payload.positive,
        dialogOpen: action.payload.dialogOpen,
      };
    case ActionTypes.ClearMsg:
      return {
        ...state,
        visible: false,
      };

    default:
      return state;
  }
}

export default function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, {
    visible: false,
  });

  return (
    <MessageContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MessageContext.Provider>
  );
}
