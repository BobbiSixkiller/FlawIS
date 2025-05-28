import { CheckIcon, TrashIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { cn } from "@/utils/helpers";
import Button from "@/components/Button";
import { Editor } from "@tiptap/react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }
}

export const LinkSelector = ({ editor }: { editor?: Editor }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [val, setVal] = useState("");

  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "textEditor");

  if (!editor) return null;

  return (
    <Popover>
      <PopoverButton
        as={Button}
        size="sm"
        variant="ghost"
        className="inline-flex gap-2 rounded-none border-none dark"
      >
        <LinkIcon className="h-4 w-4" />
        <p
          className={cn("underline decoration-stone-400 underline-offset-4", {
            "text-blue-500": editor.isActive("link"),
          })}
        >
          Link
        </p>
      </PopoverButton>
      <PopoverPanel className="absolute z-10 mt-2 w-60 rounded-md text-gray-900 shadow-lg  dark:bg-gray-800 flex items-center space-x-2">
        <input
          autoFocus
          ref={inputRef}
          type="text"
          placeholder={t("linkPlaceholder")}
          className="flex-1 bg-gray-100 dark:bg-gray-700 h-8 dark:text-white text-sm rounded p-1 outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={editor.getAttributes("link").href || ""}
          onChange={(e) => setVal(e.target.value)}
        />

        {editor.getAttributes("link").href ? (
          <Button
            size="icon"
            variant="destructive"
            className="h-8"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            className="h-8"
            onClick={(e: any) => {
              e.preventDefault();
              const url = getUrlFromString(val);
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
        )}
      </PopoverPanel>
    </Popover>
  );
};
