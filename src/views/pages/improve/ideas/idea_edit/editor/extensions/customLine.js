import {
  Extension,
} from "@tiptap/core";


export const customNewline = Extension.create({
  name: "newline",
  priority: 1000, // Optional
  addCommands() {
    return {
      addNewline:
        () =>
        ({ state, dispatch }) => {
          const { schema, tr } = state;
          const paragraph = schema.nodes.paragraph;

          const transaction = tr
            .deleteSelection()
            .replaceSelectionWith(paragraph.create(), true)
            .scrollIntoView();
          if (dispatch) dispatch(transaction);
          return true;
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": () => this.editor.commands.addNewline(),
    };
  },
});
