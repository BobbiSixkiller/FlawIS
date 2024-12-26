import { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import { items } from "./NodeSelector";

export default function CommandsDropdown({ editor }: { editor?: Editor }) {
  const [state, setState] = useState({
    visible: false,
    position: { top: 0, left: 0 },
    filter: "",
    selectedIndex: 0,
  });

  if (!editor) return null;

  const storage = editor.storage.SlashCommand;

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

    editor.options.extensions.forEach((extension: any) => {
      if (extension.name === "SlashCommand") {
        extension.options.onUpdate = handleUpdate;
      }
    });

    return () => {
      editor.options.extensions.forEach((extension: any) => {
        if (extension.name === "SlashCommand") {
          extension.options.onUpdate = null;
        }
      });
    };
  }, [editor]);

  if (!state.visible) return null;

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
      className="z-50 bg-white border shadow-md rounded-lg p-2"
    >
      {filteredItems.map((item, index) => (
        <div
          key={item.name}
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
            index === state.selectedIndex ? "bg-gray-100" : ""
          }`}
          onClick={() => {
            item.command(editor);
            setState({ ...state, visible: false });
            editor.view.focus();
          }}
        >
          <item.icon className="w-5 h-5 text-gray-700" />
          <span className="text-gray-800">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
