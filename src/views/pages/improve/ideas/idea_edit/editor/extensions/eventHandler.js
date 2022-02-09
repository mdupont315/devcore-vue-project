import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const EventHandler = Extension.create({
  name: "eventHandler",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("eventHandler"),
        props: {
          handleClick(view, pos, event) {
            console.log(event)
            console.log(view)
            if (event.target.className === "editIdea-test-custom-class") {
              console.log("CLICKED +!!!!");
            }
          },
          handleDoubleClick(view, pos, event) {
            console.log("Double Clicked!");
          },
          handlePaste(view, event, slice) {
            console.log("Pasted Content!");
          }
          // … and many, many more.
          // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        }
      })
    ];
  }
});
