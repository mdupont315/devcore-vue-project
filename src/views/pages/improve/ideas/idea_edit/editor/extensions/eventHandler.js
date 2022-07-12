import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export const EventHandler = Extension.create({
  name: "eventHandler",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("eventHandler"),

        // props: {
        //   handleClick(view, pos, event) {
        //     console.log("Clicked editor!")
        //     console.log(event.target.localName)
        //     return true
        //   },
        //   handleDoubleClick(view, pos, event) {
        //     console.log("Double Clicked!");
        //   },
        //   handlePaste(view, event, slice) {
        //   //  console.log(slice)
        //   //  console.log("Pasted Content!");
        //   }
        //   // … and many, many more.
        //   // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        // }
      })
    ];
  }
});
