import Icon from "@/components/Icon";
import { cn } from "@/lib/utilsClient";
import { SelectorItem } from "./NodeSelector";
import Button from "@/components/Button";
import { Editor } from "@tiptap/core";

export const TextButtons = ({ editor }: { editor: Editor }) => {
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
          size="sm"
          className="rounded-none border-none dark focus:ring-0"
          variant="ghost"
        >
          <Icon
            name={item.icon}
            className={cn("h-4 w-4", {
              "text-blue-500": item.isActive(editor), // Ensures dynamic class application
            })}
          />
        </Button>
      ))}
    </div>
  );
};
