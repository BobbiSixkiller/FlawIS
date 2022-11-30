import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

export const MenuItemsContext = createContext<{
  menuItems: ReactNode;
  setMenuItems: Dispatch<SetStateAction<ReactNode>>;
}>({ menuItems: null, setMenuItems: () => null });

export function MenuItemsProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<ReactNode>([]);

  return (
    <MenuItemsContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </MenuItemsContext.Provider>
  );
}
