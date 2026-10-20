"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
      variant="ghost"
      className="justify-start"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      nativeButton={false}
      role="link"
      render={<Link href={href} />}
    >
      {icon} {text}
      {active && <span className="ml-auto">•</span>}
    </Button>
  );
}
