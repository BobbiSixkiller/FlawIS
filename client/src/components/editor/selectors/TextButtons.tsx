import { EditorBubbleItem, useEditor } from "novel";
import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/helpers";
import { Button } from "@/components/MyButton";
import { SelectorItem } from "./NodeSelector";

export const TextButtons = () => {
  const { editor } = useEditor();

  if (!editor) return null;

  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor?.isActive("bold") ?? false,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => editor?.isActive("italic") ?? false,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => editor?.isActive("underline") ?? false,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => editor?.isActive("strike") ?? false,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: (editor) => editor?.isActive("code") ?? false,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: CodeBracketIcon,
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={() => item.command(editor)} // Simplified call
        >
          <Button
            onClick={(e) => e.preventDefault()}
            size="sm"
            className="rounded-none"
            variant="ghost"
          >
            <item.icon
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor), // Ensures dynamic class application
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
