"use client";

import Icon, { type IconName } from "@/components/icon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
    <Popover>
      <PopoverTrigger
        render={<Button size="sm" variant="ghost" />}
        className="gap-2"
      >
        <span className="whitespace-nowrap text-sm">{t(activeItem.name)}</span>
        <Icon
          name="chevron-down"
          className="size-4 group-data-open:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className={"w-52 gap-0.5 p-1"}>
        {items.map((item, index) => (
          <button
            type="button"
            key={index}
            onClick={() => {
              item.command(editor);
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
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
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
