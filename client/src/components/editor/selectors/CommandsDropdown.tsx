import { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import { items } from "./NodeSelector";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function CommandsDropdown({ editor }: { editor?: Editor }) {
  const storage: {
    visible: boolean;
    position: { top: number; left: number };
    filter: string;
    selectedIndex: number;
  } = editor?.storage.SlashCommand;
  const [state, setState] = useState(storage);
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "editor");

  useEffect(() => {
    const handleUpdate = (
      filter: string,
      position: any,
      selectedIndex: number
    ) => {
      setState({
        visible: storage.visible,
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
  }, [editor]);

  if (!state.visible || !editor) return null;

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(state.filter.toLowerCase())
  );

  return (
    <div
      style={{
        position: "absolute",
        top: state.position.top,
        left: state.position.left,
      }}
      className="z-50 bg-black border border-black shadow-md rounded-lg p-2"
    >
      {filteredItems.map((item, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-white/30 rounded ${
            index === storage.selectedIndex ? "bg-white/30" : ""
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
          <item.icon className="size-5 text-white" />
          <span className="text-white">{t(item.name)}</span>
        </div>
      ))}
    </div>
  );
}
