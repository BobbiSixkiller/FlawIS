import { cn } from "@/utils/helpers";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

// Placeholder configuration
const placeholder = Placeholder.configure({
  placeholder: ({ node }) => {
    switch (node.type.name) {
      case "heading":
        return `Nadpis ${node.attrs.level}...`;
      case "bulletList":
      case "orderedList":
      case "taskList":
        return "Text odrazky...";
      default:
        return "Press '/' for commandiky...";
    }
  },
  emptyNodeClass: cn(
    "text-gray-400 relative before:absolute before:content-[attr(data-placeholder)]"
  ),
  includeChildren: true,
});

// Link extension configuration
const tiptapLink = Link.configure({
  HTMLAttributes: {
    class: cn("hover:underline text-primary-500 cursor-pointer"),
  },
});

// Image extension configuration with custom plugin
// const tiptapImage = Image.extend({
//   addProseMirrorPlugins() {
//     return [
//       UploadImagesPlugin({
//         imageClass: cn("opacity-40 rounded-lg border"),
//       }),
//     ];
//   },
// }).configure({
//   allowBase64: true,
//   HTMLAttributes: {
//     class: cn("rounded-lg border"),
//   },
// });

// Horizontal rule configuration
const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cn("mt-4 mb-6 border-t"),
  },
});

// StarterKit configuration with customizations
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
  horizontalRule: false, // Custom horizontal rule used
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

// Underline extension
const underline = Underline;

// Exporting the default extensions
export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  horizontalRule,
  underline,
];
