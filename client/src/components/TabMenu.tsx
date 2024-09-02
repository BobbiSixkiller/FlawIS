"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

interface TabProps {
  name: string;
  href: string;
  icon?: ReactNode;
}

export default function TabMenu({ tabs }: { tabs: TabProps[] }) {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="h-20">
      <nav className="flex gap-3 overflow-x-auto items-center">
        {tabs.map((tab, i) => (
          <div key={i} className="h-14 flex items-center relative">
            <Link
              href={tab.href}
              className={`px-4 py-1 rounded-md hover:bg-gray-700 hover:bg-opacity-10 inline-flex items-center gap-2 ${
                (segment && tab.href.includes(segment)) || (!segment && i === 0)
                  ? "font-bold"
                  : "font-normal"
              }`}
            >
              {tab.icon}
              {tab.name}
            </Link>
            {(segment && tab.href.includes(segment)) ||
            (!segment && i === 0) ? (
              <div className="h-1 z-10 rounded-full bg-primary-500 absolute bottom-0 left-0 right-0" />
            ) : null}
          </div>
        ))}
      </nav>
      <div className="h-[1px] w-full bg-gray-300 -translate-y-[2px]" />
    </div>
  );
}
