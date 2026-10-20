import Icon from "@/components/icon";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utilsClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { t } = useTranslation(lng, "texteditor");

  if (!editor) return null;

  return (
    <Popover>
      <PopoverTrigger
        render={<Button size="sm" variant="ghost" />}
        className="inline-flex gap-2"
      >
        <Icon name="link" className="h-4 w-4" />
        <p
          className={cn(
            "underline decoration-muted-foreground underline-offset-4",
            {
              "text-primary": editor.isActive("link"),
            },
          )}
        >
          {t("link")}
        </p>
      </PopoverTrigger>
      <PopoverContent className="w-72 flex-row items-center gap-2">
        <Input
          autoFocus
          ref={inputRef}
          type="text"
          aria-label={t("linkPlaceholder")}
          placeholder={t("linkPlaceholder")}
          className="min-w-0 flex-1"
          defaultValue={editor.getAttributes("link").href || ""}
          onChange={(e) => setVal(e.target.value)}
        />

        {editor.getAttributes("link").href ? (
          <Button
            size="icon"
            aria-label={t("removeLink")}
            variant="destructive"
            className="h-8"
            onClick={() => {
              editor.chain().focus().unsetLink().run();
            }}
          >
            <Icon name="trash" className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            aria-label={t("applyLink")}
            onClick={(e) => {
              e.preventDefault();
              const url = getUrlFromString(val);
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            <Icon name="check" className="h-4 w-4" />
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
