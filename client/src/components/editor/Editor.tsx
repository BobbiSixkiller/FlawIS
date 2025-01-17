"use client";

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Editor,
  JSONContent,
} from "@tiptap/react";
import { defaultExtensions } from "./Extensions";
import { LinkSelector } from "./selectors/LinkSelector";
import { items, NodeSelector } from "./selectors/NodeSelector";
import { TextButtons } from "./selectors/TextButtons";
import { useDebouncedCallback } from "use-debounce";
import { useController } from "react-hook-form";

import { cn } from "@/utils/helpers";
import { SlashCommandExtension } from "./SlashCommand";
import CommandsDropdown from "./selectors/CommandsDropdown";

interface EditorProps {
  initialValue?: string | JSONContent; // Use HTML or JSON as needed
  name: string;
}

export default function TiptapEditor({ initialValue, name }: EditorProps) {
  const { field, fieldState } = useController({ name });

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
        class: cn(
          "rose prose-lg prose-headings:font-title font-default focus:outline-none max-w-full min-h-96 p-3 shadow-sm text-gray-900 placeholder:text-gray-400 rounded-md ring-1 focus-within:ring-2",
          fieldState.error
            ? "ring-red-500 focus-within:ring-red-500"
            : "ring-gray-300 focus-within:ring-primary-500"
        ),
      },
    },
  });

  const debouncedUpdates = useDebouncedCallback((editor: Editor) => {
    if (editor) {
      field.onChange(editor.getHTML());
    }
  }, 500);

  return (
    <div>
      <div className="relative">
        {editor && (
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
        )}
        {editor && <CommandsDropdown editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      {fieldState.error && (
        <p className="text-sm text-red-500">{fieldState.error.message}</p>
      )}
    </div>
  );
}
