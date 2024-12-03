"use client";

import { useState } from "react";

import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { TextButtons } from "./selectors/TextButtons";
import { NodeSelector } from "./selectors/NodeSelector";
import { LinkSelector } from "./selectors/LinkSelector";
import { useParams } from "next/navigation";
import { slashCommand, suggestionItems } from "./slashCommands";

const extensions = [...defaultExtensions, slashCommand];

interface EditorProps {
  initialValue?: JSONContent;
  onChange: (content: string) => void;
}

export default function Editor({ initialValue, onChange }: EditorProps) {
  const { lng } = useParams<{ lng: string }>();

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getHTML();
      onChange(json);
    },
    500
  );

  const defaultContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "Nadpis 1",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is an example for the editor",
          },
        ],
      },
      {
        type: "bulletList",
        attrs: {
          tight: true,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "new idea",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "idea",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <EditorRoot>
      <EditorContent
        immediatelyRender={false}
        initialContent={undefined}
        extensions={extensions}
        onUpdate={({ editor }) => debouncedUpdates(editor)}
        className="min-h-96 rounded-md ring-1 ring-gray-300 p-3 shadow-sm text-gray-900 placeholder:text-gray-400"
        editorProps={{
          attributes: {
            class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
          },
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border bg-black text-white px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-white/30 hover:bg-white/30`}
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: "top",
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-black text-white shadow-xl"
        >
          <NodeSelector />
          <div className="w-px flex-1 bg-white/30" />
          <LinkSelector />
          <div className="w-px flex-1 bg-white/30" />
          <TextButtons />
          {/* <ColorSelector open={openColor} onOpenChange={setOpenColor} /> */}
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
