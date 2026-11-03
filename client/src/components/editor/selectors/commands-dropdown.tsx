import { Editor } from "@tiptap/core";
import Icon from "@/components/icon";
import { useEffect, useState } from "react";
import { items } from "./node-selector";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function CommandsDropdown({ editor }: { editor?: Editor }) {
  const storage = editor?.storage.SlashCommand;
  const [state, setState] = useState(storage);
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "editor");

  useEffect(() => {
    const handleUpdate = (
      filter: string,
      position: any,
      selectedIndex: number,
    ) => {
      setState({
        visible: storage?.visible ?? false,
        position,
        filter,
        selectedIndex,
      });
    };

    editor?.options.extensions.forEach((extension: any) => {
      if (extension.name === "SlashCommand") {
        extension.options.onUpdate = handleUpdate;
      }
    });

    return () => {
      editor?.options.extensions.forEach((extension: any) => {
        if (extension.name === "SlashCommand") {
          extension.options.onUpdate = null;
        }
      });
    };
  }, [editor, storage?.visible]);

  if (!state?.visible || !editor || !storage) return null;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(state.filter.toLowerCase()),
  );

  return (
    <div
      style={{
        position: "absolute",
        top: state.position.top,
        left: state.position.left,
      }}
      className="z-50 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
    >
      {filteredItems.map((item, index) => (
        <button
          type="button"
          key={index}
          className={`flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent focus-visible:bg-accent ${
            index === storage.selectedIndex ? "bg-accent" : ""
          }`}
          onClick={() => {
            const { state: editorState } = editor.view;
            const { from, to } = editorState.selection;
            const slashStartPos = from - storage.filter.length - 1;

            item.command(editor);

            editor
              .chain()
              .focus()
              .deleteRange({ from: slashStartPos, to })
              .run();

            storage.visible = false;

            setState({ ...state, visible: false });
            editor.view.focus();
          }}
        >
          <Icon name={item.icon} className="size-4" />
          <span>{t(item.name)}</span>
        </button>
      ))}
    </div>
  );
}
