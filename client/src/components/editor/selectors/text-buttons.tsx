import Icon from "@/components/icon";
import { cn } from "@/lib/utilsClient";
import { SelectorItem } from "./node-selector";
import { Button } from "@/components/ui/button";
import { Editor } from "@tiptap/core";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export const TextButtons = ({ editor }: { editor: Editor }) => {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "texteditor");
  if (!editor) return null;

  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor?.isActive("bold") ?? false,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: "bold",
    },
    {
      name: "italic",
      isActive: (editor) => editor?.isActive("italic") ?? false,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: "italic",
    },
    {
      name: "underline",
      isActive: (editor) => editor?.isActive("underline") ?? false,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: "underline",
    },
    {
      name: "strike",
      isActive: (editor) => editor?.isActive("strike") ?? false,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: "strikethrough",
    },
    {
      name: "code",
      isActive: (editor) => editor?.isActive("code") ?? false,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: "code-bracket",
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <Button
          key={index}
          onClick={() => item.command(editor)}
          size="icon-sm"
          aria-label={t(item.name)}
          aria-pressed={item.isActive(editor)}
          variant="ghost"
        >
          <Icon
            name={item.icon}
            className={cn("h-4 w-4", {
              "text-primary": item.isActive(editor),
            })}
          />
        </Button>
      ))}
    </div>
  );
};
