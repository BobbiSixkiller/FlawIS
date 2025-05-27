"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

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
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 p-2 text-white dark:text-white/85 hover:bg-primary-700 dark:hover:bg-gray-700 rounded-md outline-none focus:ring-2 focus:ring-inset focus:ring-white"
    >
      {icon} {text}
      {active && <span className="ml-auto self-start">•</span>}
    </Link>
  );
}
