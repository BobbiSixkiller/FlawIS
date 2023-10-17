"use client";

import { ActionTypes, DrawerContext } from "@/app/providers/DrawerProvider";
import { Menu } from "@headlessui/react";
import Image from "next/image";
import { ReactNode, useContext, useEffect } from "react";

export default function Nav({ children }: { children: ReactNode }) {
  const { dispatch, visible, drawerItems } = useContext(DrawerContext);
  console.log(visible);

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetItems,
      payload: {
        drawerItems: [],
      },
    });
  }, []);

  return (
    <Menu as="div" className="flex flex-col relative min-h-screen">
      <Menu.Items>
        <div className="absolute inset-y-0 left-0 ease-in-out px-2 py-7 w-64 bg-primary-500 text-white">
          <div className="flex items-center gap-2 pb-6 px-4">
            <Image
              src="/images/Flaw-logo-notext-inverted.png"
              width={35}
              height={35}
              alt="Picture of the author"
            />
            <span className="text-2xl">FlawIS</span>
          </div>
          <nav>{drawerItems}</nav>
        </div>
      </Menu.Items>

      <div>Menu bar</div>
      <div>{children}</div>
    </Menu>
  );
}
