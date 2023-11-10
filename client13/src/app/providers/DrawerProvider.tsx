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
  SetMenuItems = "SET_MENU_ITEMS",
  SetDrawerItems = "SET_DRAWER_ITEMS",
  SetVisible = "SET_VISIBLE",
}

type ActionPayload = {
  [ActionTypes.SetDrawerItems]: { drawerItems: ReactNode };
  [ActionTypes.SetMenuItems]: { menuItems: ReactNode };
  [ActionTypes.SetVisible]: { visible: boolean };
};

type DrawerActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type DrawerState = {
  menuItems: ReactNode;
  drawerItems: ReactNode;
  visible: boolean;
};

export const DrawerContext = createContext<
  DrawerState & { dispatch: Dispatch<DrawerActions> }
>({ drawerItems: null, menuItems: null, visible: false, dispatch: () => null });

function drawerReducer(state: DrawerState, action: DrawerActions): DrawerState {
  switch (action.type) {
    case ActionTypes.SetDrawerItems:
      return { ...state, drawerItems: action.payload.drawerItems };
    case ActionTypes.SetMenuItems:
      return { ...state, menuItems: action.payload.menuItems };
    case ActionTypes.SetVisible:
      return { ...state, visible: action.payload.visible };

    default:
      throw new Error("Unhandled action type!");
  }
}

export default function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(drawerReducer, {
    visible: false,
    drawerItems: null,
    menuItems: null,
  });

  return (
    <DrawerContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DrawerContext.Provider>
  );
}
