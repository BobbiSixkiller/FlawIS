"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";
import Button from "./Button";

export interface NavLinkProps {
  icon: ReactNode;
  text: string;
  href: string;
  onClick?: () => void;
}

export default function NavLink({ icon, text, href, onClick }: NavLinkProps) {
  const segment = useSelectedLayoutSegment();
  const active = href === `/${segment}` || (segment === null && href === "/");

  return (
    <Button
      as={Link}
      variant="ghost"
      className="text-white justify-start"
      href={href}
      onClick={onClick}
    >
      {icon} {text}
      {active && <span className="ml-auto">•</span>}
    </Button>
  );
}
