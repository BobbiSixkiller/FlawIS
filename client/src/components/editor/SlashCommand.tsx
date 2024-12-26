import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { SelectorItem } from "./selectors/NodeSelector";

export const SlashCommandExtension = Extension.create({
  name: "SlashCommand",

  addOptions() {
    return {
      items: [],
      onSelect: null,
      onUpdate: null,
    };
  },

  addStorage() {
    return {
      visible: false,
      filter: "",
      position: { top: 0, left: 0 },
      selectedIndex: 0,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("SlashCommand"),
        props: {
          handleKeyDown: (view, event) => {
            const { storage } = this;
            const { state } = view;

            const editor = this.editor; // Use the TipTap editor instance

            const filteredItems = this.options.items.filter(
              (item: SelectorItem) =>
                item.name.toLowerCase().includes(storage.filter.toLowerCase())
            );

            // Handle "/"
            if (event.key === "/" && !storage.visible) {
              const { $anchor } = state.selection;
              const position = view.coordsAtPos($anchor.pos);
              // Adjust for editor container offsets
              const editorRect = view.dom.getBoundingClientRect();
              const dropdownPosition = {
                top: position.top + 30 - editorRect.top, // Relative to editor
                left: position.left - editorRect.left, // Relative to editor
              };

              storage.visible = true;
              storage.position = dropdownPosition;
              storage.filter = "";
              this.options.onUpdate?.(storage.filter, storage.position);
              return false; // Allow "/" to be added to the document
            }

            // Handle keyboard navigation
            if (event.key === "ArrowDown" && storage.visible) {
              storage.selectedIndex =
                (storage.selectedIndex + 1) % filteredItems.length;
              this.options.onUpdate?.(
                storage.filter,
                storage.position,
                storage.selectedIndex
              );
              return true;
            }

            if (event.key === "ArrowUp" && storage.visible) {
              storage.selectedIndex =
                (storage.selectedIndex - 1 + filteredItems.length) %
                filteredItems.length;
              this.options.onUpdate?.(
                storage.filter,
                storage.position,
                storage.selectedIndex
              );
              return true;
            }

            if (event.key === "Enter" && storage.visible) {
              if (filteredItems[storage.selectedIndex]) {
                filteredItems[storage.selectedIndex].command(editor);
                storage.visible = false; // Close dropdown
                storage.selectedIndex = 0; // Reset index
                this.options.onUpdate?.(null, null);
                event.preventDefault();
                return true;
              }
            }

            // Handle typing after "/"
            if (storage.visible && /^[a-zA-Z0-9]$/.test(event.key)) {
              storage.filter += event.key;
              this.options.onUpdate?.(storage.filter, storage.position);
              return false; // Allow characters to be added to the document
            }

            // Handle Backspace
            if (storage.visible && event.key === "Backspace") {
              if (storage.filter.length > 0) {
                storage.filter = storage.filter.slice(0, -1);
                this.options.onUpdate?.(storage.filter, storage.position);
                return false; // Allow editor to process Backspace
              } else {
                storage.visible = false;
                this.options.onUpdate?.(null, null);
                return false; // Allow Backspace to remove "/"
              }
            }

            // Handle Escape
            if (storage.visible && event.key === "Escape") {
              storage.visible = false;
              this.options.onUpdate?.(null, null);
              return true; // Prevent Escape from propagating
            }

            return false; // Let the editor handle all other cases
          },
        },
      }),
    ];
  },
});
