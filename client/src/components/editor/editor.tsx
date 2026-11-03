"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { LinkSelector } from "./selectors/link-selector";
import { items, NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";

import { cn } from "@/lib/utilsClient";
import {
  useEffect,
  useImperativeHandle,
  type AriaAttributes,
  type Ref,
} from "react";
import useLocalizedExtensions from "./extensions";
import { SlashCommandExtension } from "./slash-command";
import CommandsDropdown from "./selectors/commands-dropdown";

interface EditorProps extends AriaAttributes {
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  ref?: Ref<{ focus: () => void }>;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}
export default function TiptapEditor({
  className,
  value,
  onChange,
  onBlur,
  id,
  ref,
  disabled,
  compact,
  ...props
}: EditorProps) {
  const { defaultExtensions } = useLocalizedExtensions();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...defaultExtensions,
      SlashCommandExtension.configure({ items }),
    ], // Add extensions here
    content: value ?? "",
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        role: "textbox",
        "aria-multiline": "true",
        ...(props["aria-label"] ? { "aria-label": props["aria-label"] } : {}),
        "aria-invalid": String(Boolean(props["aria-invalid"])),
        ...(props["aria-describedby"]
          ? { "aria-describedby": props["aria-describedby"] }
          : {}),
        ...(props["aria-labelledby"]
          ? { "aria-labelledby": props["aria-labelledby"] }
          : {}),
        class: cn([
          className,
          "prose prose-sm max-w-none dark:prose-invert prose-a:text-primary",
          compact ? "min-h-8" : "min-h-96",
          "focus:outline-hidden p-3 shadow-xs text-foreground placeholder:text-muted-foreground rounded-md ring-1 focus-within:ring-2",
          "dark:ring-input dark:bg-card",
          props["aria-invalid"]
            ? "ring-destructive focus-within:ring-destructive"
            : "ring-input focus-within:ring-ring dark:focus-within:ring-ring",
        ]),
      },
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        editor?.commands.focus();
      },
    }),
    [editor],
  );
  useEffect(() => {
    if (editor && editor.getHTML() !== (value ?? ""))
      editor.commands.setContent(value ?? "", { emitUpdate: false });
  }, [editor, value]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="relative">
        <BubbleMenu
          editor={editor}
          options={{
            placement: "top",
          }}
          className="flex w-fit max-w-[90vw] overflow-x-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <NodeSelector editor={editor} />
          <div className="my-1 w-px self-stretch bg-border" />
          <LinkSelector editor={editor} />
          <div className="my-1 w-px self-stretch bg-border" />
          <TextButtons editor={editor} />
        </BubbleMenu>

        <CommandsDropdown editor={editor} />

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
