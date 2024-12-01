import {
  ChevronDownIcon,
  ListBulletIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  NumberedListIcon,
  SlashIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  Bars3CenterLeftIcon,
} from "@heroicons/react/24/outline";
import { createSuggestionItems } from "novel/extensions";
import { Command, renderItems } from "novel/extensions";
// import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
  //   {
  //     title: "Send Feedback",
  //     description: "Let us know how we can improve.",
  //     icon: <MessageSquarePlus size={18} />,
  //     command: ({ editor, range }) => {
  //       editor.chain().focus().deleteRange(range).run();
  //       window.open("/feedback", "_blank");
  //     },
  //   },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Bars3CenterLeftIcon className="size-5" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  //   {
  //     title: "To-do List",
  //     description: "Track tasks with a to-do list.",
  //     searchTerms: ["todo", "task", "list", "check", "checkbox"],
  //     icon: <CheckSquare size={18} />,
  //     command: ({ editor, range }) => {
  //       editor.chain().focus().deleteRange(range).toggleTaskList().run();
  //     },
  //   },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <H1Icon className="size-5" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <H2Icon className="size-5" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <H3Icon className="size-5" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <ListBulletIcon className="size-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <NumberedListIcon className="size-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <ChatBubbleBottomCenterTextIcon className="size-5" />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <SlashIcon className="size-5" />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  //   {
  //     title: "Image",
  //     description: "Upload an image from your computer.",
  //     searchTerms: ["photo", "picture", "media"],
  //     icon: <ImageIcon size={18} />,
  //     command: ({ editor, range }) => {
  //       editor.chain().focus().deleteRange(range).run();
  //       // upload image
  //       const input = document.createElement("input");
  //       input.type = "file";
  //       input.accept = "image/*";
  //       input.onchange = async () => {
  //         if (input.files?.length) {
  //           const file = input.files[0];
  //           const pos = editor.view.state.selection.from;
  //           uploadFn(file, editor.view, pos);
  //         }
  //       };
  //       input.click();
  //     },
  //   },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
