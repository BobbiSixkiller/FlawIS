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
  CleanAll = "CLEAN_ALL",
  SetItems = "SET_ITEMS",
  Toggle = "TOGGLE",
}

type ActionPayload = {
  [ActionTypes.SetItems]: { drawerItems: ReactNode };
  [ActionTypes.CleanAll]: undefined;
  [ActionTypes.Toggle]: undefined;
};

type DrawerActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type DrawerState = {
  drawerItems: ReactNode;
  visible: boolean;
};

export const DrawerContext = createContext<
  DrawerState & { dispatch: Dispatch<DrawerActions> }
>({ drawerItems: null, visible: false, dispatch: () => null });

function drawerReducer(state: DrawerState, action: DrawerActions): DrawerState {
  switch (action.type) {
    case ActionTypes.CleanAll:
      return { ...state, drawerItems: null };
    case ActionTypes.SetItems:
      return { ...state, drawerItems: action.payload.drawerItems };
    case ActionTypes.Toggle:
      return { ...state, visible: !state.visible };

    default:
      throw new Error("Unhandled action type!");
  }
}

export default function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(drawerReducer, {
    visible: false,
    drawerItems: null,
  });

  return (
    <DrawerContext.Provider value={{ ...state, dispatch }}>
      <div className="flex relative min-h-screen">
        <div className="w-64 bg-primary-500">
          <h1>HEADER</h1>
          <nav>{state.drawerItems}</nav>
        </div>
        {/* content container */}
        <div className="p-10 flex-1">{children}</div>
      </div>
    </DrawerContext.Provider>
  );
}
