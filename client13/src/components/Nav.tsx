"use client";

import { DrawerContext } from "@/app/providers/DrawerProvider";
import { ReactNode, useContext } from "react";

export default function Nav() {
  const { dispatch, visible, drawerItems } = useContext(DrawerContext);
  console.log(visible);

  return <div>navigation</div>;
}
