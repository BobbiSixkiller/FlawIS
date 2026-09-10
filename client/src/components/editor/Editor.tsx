"use client";

import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import { LinkSelector } from "./selectors/LinkSelector";
import { items, NodeSelector } from "./selectors/NodeSelector";
import { TextButtons } from "./selectors/TextButtons";

import { cn } from "@/lib/utilsClient";
import {
  useEffect,
  useImperativeHandle,
  type AriaAttributes,
  type Ref,
} from "react";
import useLocalizedExtensions from "./Extensions";
import { SlashCommandExtension } from "./SlashCommand";
import CommandsDropdown from "./selectors/CommandsDropdown";

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
          "prose prose-lg prose-headings:font-title font-default prose-a:no-underline",
          compact ? "min-h-8" : "min-h-96",
          "focus:outline-hidden p-3 shadow-xs text-gray-900 placeholder:text-gray-400 rounded-md ring-1 focus-within:ring-2",
          "dark:ring-gray-700 dark:bg-gray-800",
          props["aria-invalid"]
            ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
            : "ring-gray-300 focus-within:ring-primary-500 dark:focus-within:ring-primary-300",
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
      editor.commands.setContent(value ?? "", false);
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
          tippyOptions={{
            placement: "top",
            duration: 100,
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-black bg-black text-white shadow-xl"
        >
          <NodeSelector editor={editor} />
          <div className="w-px flex-1 bg-white/30" />
          <LinkSelector editor={editor} />
          <div className="w-px flex-1 bg-white/30" />
          <TextButtons editor={editor} />
        </BubbleMenu>

        <CommandsDropdown editor={editor} />

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
