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
  SetAppMsg = "SET_APP_MSG",
  ClearAppMsg = "CLEAR_APP_MSG",
  SetFormMsg = "SET_FORM_MSG",
  ClearFormMsg = "CLEAR_FORM_MSG",
}

type ActionPayload = {
  [ActionTypes.SetAppMsg]: { message: string; success: boolean };
  [ActionTypes.ClearAppMsg]: undefined;
  [ActionTypes.SetFormMsg]: { message: string; success: boolean };
  [ActionTypes.ClearFormMsg]: undefined;
};

type MessageActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type MessageState = {
  appMessage: { visible: boolean; content: string; success: boolean };
  formMessage: { visible: boolean; content: string; success: boolean };
};

export const MessageContext = createContext<
  MessageState & { dispatch: Dispatch<MessageActions> }
>({
  appMessage: { visible: false, content: "", success: false },
  formMessage: { visible: false, content: "", success: false },
  dispatch: () => null,
});

function messageReducer(state: MessageState, action: MessageActions) {
  switch (action.type) {
    case ActionTypes.SetAppMsg:
      return {
        ...state,
        appMessage: {
          visible: true,
          content: action.payload.message,
          success: action.payload.success,
        },
      };
    case ActionTypes.ClearAppMsg:
      return {
        ...state,
        appMessage: { ...state.appMessage, visible: false },
      };

    case ActionTypes.SetFormMsg:
      return {
        ...state,
        formMessage: {
          visible: true,
          content: action.payload.message,
          success: action.payload.success,
        },
      };
    case ActionTypes.ClearFormMsg:
      return {
        ...state,
        formMessage: { ...state.formMessage, visible: false },
      };

    default:
      return state;
  }
}

export default function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, {
    appMessage: { visible: false, content: "", success: false },
    formMessage: { visible: false, content: "", success: false },
  });

  return (
    <MessageContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MessageContext.Provider>
  );
}
