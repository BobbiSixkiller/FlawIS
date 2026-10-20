"use client";

import { cn } from "@/lib/utilsClient";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function useLocalizedExtensions() {
  const { lng } = useParams<{ lng: string }>();

  const { t } = useTranslation(lng, "common");

  // Placeholder configuration
  const placeholder = Placeholder.configure({
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case "heading":
          return t("placeholder.heading", { lvl: node.attrs.level });
        case "bulletList":
          return t("placeholder.list");

        case "orderedList":
          return t("placeholder.list");

        case "taskList":
        default:
          return t("placeholder.default");
      }
    },
    emptyNodeClass: cn(
      "text-muted-foreground relative before:absolute before:content-[attr(data-placeholder)]",
    ),
    includeChildren: true,
  });

  // Link extension configuration
  const tiptapLink = Link.configure({
    HTMLAttributes: {
      class: cn([
        "hover:underline text-primary hover:text-primary/90 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "dark:text-primary dark:hover:text-accent-foreground dark:focus:ring-offset-background dark:focus:ring-ring",
      ]),
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
    link: false,
    underline: false,
    bold: { HTMLAttributes: { class: cn("dark:text-foreground") } },
    heading: {
      HTMLAttributes: { class: cn("dark:text-foreground font-normal") },
    },
    paragraph: { HTMLAttributes: { class: cn("dark:text-muted-foreground") } },
    bulletList: {
      HTMLAttributes: {
        class: cn(
          "list-disc list-outside leading-3 dark:text-muted-foreground marker:text-primary dark:marker:text-primary",
        ),
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: cn(
          "list-decimal list-outside leading-3 dark:text-muted-foreground marker:text-primary dark:marker:text-primary",
        ),
      },
    },
    listItem: {
      HTMLAttributes: {
        class: cn("leading-normal"),
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: cn("border-l-2 border-primary dark:border-primary pl-4"),
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: cn(
          "rounded-md bg-muted/30 text-foreground border p-3 font-mono font-medium",
        ),
      },
    },
    code: {
      HTMLAttributes: {
        class: cn(
          "rounded-md bg-muted/30 px-1.5 py-1 font-mono font-medium",
        ),
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
  return {
    defaultExtensions: [
      starterKit,
      placeholder,
      tiptapLink,
      horizontalRule,
      underline,
    ],
  };
}
