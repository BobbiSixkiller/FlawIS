"use client";

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Editor,
  JSONContent,
} from "@tiptap/react";
import { LinkSelector } from "./selectors/LinkSelector";
import { items, NodeSelector } from "./selectors/NodeSelector";
import { TextButtons } from "./selectors/TextButtons";
import { useDebouncedCallback } from "use-debounce";
import { useController } from "react-hook-form";

import { cn } from "@/utils/helpers";
import { SlashCommandExtension } from "./SlashCommand";
import CommandsDropdown from "./selectors/CommandsDropdown";
import useLocalizedExtensions from "./Extensions";
import { useEffect, useRef } from "react";

interface EditorProps {
  initialValue?: string | JSONContent; // Use HTML or JSON as needed
  name: string;
  className?: string;
}

export default function TiptapEditor({
  className,
  initialValue,
  name,
}: EditorProps) {
  const { field, fieldState, formState } = useController({ name });
  const { defaultExtensions } = useLocalizedExtensions();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...defaultExtensions,
      SlashCommandExtension.configure({ items }),
    ], // Add extensions here
    content: initialValue,
    onUpdate: ({ editor }) => debouncedUpdates(editor),
    editorProps: {
      attributes: {
        class: cn([
          className,
          "prose prose-lg prose-headings:font-title font-default prose-a:no-underline",
          "focus:outline-none min-h-96 p-3 shadow-sm text-gray-900 placeholder:text-gray-400 rounded-md ring-1 focus-within:ring-2",
          "dark:ring-gray-700 dark:bg-gray-800",
          fieldState.error
            ? "ring-red-500 dark:ring-red-500 focus-within:ring-red-500"
            : "ring-gray-300 focus-within:ring-primary-500 dark:focus-within:ring-primary-300",
        ]),
      },
    },
  });

  useEffect(() => {
    if (
      Object.values(formState.errors).length > 0 &&
      fieldState.error &&
      editor
    ) {
      editor.commands.focus();
    }
  }, [formState, editor]);

  const debouncedUpdates = useDebouncedCallback((editor: Editor) => {
    if (editor) {
      field.onChange(editor.getHTML());
    }
  }, 500);

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
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}
