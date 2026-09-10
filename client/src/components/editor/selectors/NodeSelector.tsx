"use client";

import Icon, { type IconName } from "@/components/Icon";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { cn } from "@/lib/utilsClient";
import Button from "@/components/Button";
import { Editor } from "@tiptap/core";
import { useTranslation } from "@/lib/i18n/client";
import { useParams } from "next/navigation";

export type SelectorItem = {
  name: string;
  icon: IconName;
  command: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

export const items: SelectorItem[] = [
  {
    name: "Text",
    icon: "bars3-center-left",
    command: (editor) => editor.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: "h1",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: "h2",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: "h3",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "Bullet List",
    icon: "list-bullet",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: "numbered-list",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: "chat-bubble-bottom-center-text",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: "slash",
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];

export const NodeSelector = ({ editor }: { editor?: Editor }) => {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "editor");

  if (!editor) return null;

  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover className="group relative">
      <PopoverButton
        as={Button}
        size="sm"
        variant="ghost"
        className={cn("gap-2 rounded-none border-none dark focus:ring-0")}
      >
        <span className="whitespace-nowrap text-sm">{t(activeItem.name)}</span>
        <Icon
          name="chevron-down"
          className="size-4 group-data-open:rotate-180"
        />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom start"
        className={
          "z-50 w-48 rounded-md border bg-black border-black text-white shadow-md p-1 transition duration-200 ease-in-out [--anchor-gap:4px] sm:[--anchor-gap:8px] data-closed:-translate-y-1 data-closed:opacity-0"
        }
      >
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              item.command(editor);
            }}
            className="flex cursor-pointer hover:bg-white/30 items-center justify-between rounded-xs px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-xs border p-1">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <span>{t(item.name)}</span>
            </div>
            {activeItem.name === item.name && (
              <Icon name="check" className="h-4 w-4" />
            )}
          </div>
        ))}
      </PopoverPanel>
    </Popover>
  );
};
