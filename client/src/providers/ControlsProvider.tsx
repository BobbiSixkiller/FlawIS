import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

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
  SetDrawer = "SET_DRAWER",
  SetRightPanel = "SET_RIGHT_PANEL",
  SetFollowingMenuRight = "SET_MENU_RIGHT",
}

type ActionPayload = {
  [ActionTypes.Login]: { user: Partial<User> };
  [ActionTypes.Logout]: undefined;
};

type ControlsActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type ControlsState = {
  loading: boolean;
  user: Partial<User> | null;
};

export const MenuItemsContext = createContext<{
  menuItems: ReactNode;
  setMenuItems: Dispatch<SetStateAction<ReactNode>>;
}>({
  menuItems: null,
  setMenuItems: () => null,
});

export function MenuItemsProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<ReactNode>([]);

  return (
    <MenuItemsContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </MenuItemsContext.Provider>
  );
}
