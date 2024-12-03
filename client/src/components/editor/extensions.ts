import { cn } from "@/utils/helpers";
import Underline from "@tiptap/extension-underline";
import {
  TiptapImage,
  TiptapLink,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
} from "novel/extensions";
import { UploadImagesPlugin } from "novel/plugins";

const placeholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return `Nadpis ${node.attrs.level}...`;
    }
    if (node.type.name.includes("list")) {
      return "Text odrazky...";
    }
    return "Press '/' for commands...";
  },
  emptyNodeClass: cn(
    "text-gray-400 relative before:absolute before:content-[attr(data-placeholder)]"
  ),
  includeChildren: true,
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cn("hover:underline text-primary-500 cursor-pointer"),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cn("opacity-40 rounded-lg border"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cn("rounded-lg border"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cn("not-prose pl-2"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cn("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cn("mt-4 mb-6 border-t"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cn("list-disc list-outside leading-3 marker:text-primary-500"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cn("list-decimal list-outside leading-3 marker:text-primary-500"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cn("leading-normal"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cn("border-l-2 border-primary-500 pl-4"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cn(
        "rounded-md bg-gray-300/30 text-gray-900 border p-3 font-mono font-medium"
      ),
    },
  },
  code: {
    HTMLAttributes: {
      class: cn("rounded-md bg-gray-300/30 px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const underline = Underline;

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  taskList,
  taskItem,
  horizontalRule,
  underline,
];
