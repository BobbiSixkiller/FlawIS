"use client";

import { ActionTypes, DrawerContext } from "@/app/providers/DrawerProvider";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment, ReactNode, useContext, useEffect } from "react";

export default function Nav() {
  const { dispatch, visible, drawerItems } = useContext(DrawerContext);
  console.log(visible);

  useEffect(() => {
    dispatch({
      type: ActionTypes.SetDrawerItems,
      payload: {
        drawerItems: [<div key={0}>login</div>, <div key={1}>register</div>],
      },
    });
  }, []);

  return (
    <nav className="w-full max-w-4xl mx-auto flex justify-between align-middle">
      <div className="flex gap-2">
        <button
          onClick={() =>
            dispatch({
              type: ActionTypes.SetVisible,
              payload: { visible: true },
            })
          }
        >
          Menu
        </button>
        <div>Navigation</div>
      </div>
      <div className="flex gap-2">User & locale</div>
    </nav>
  );
}
