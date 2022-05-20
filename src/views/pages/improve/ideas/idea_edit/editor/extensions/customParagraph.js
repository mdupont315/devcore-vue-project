import { Node, mergeAttributes } from "@tiptap/core";

export const Paragraph = Node.create({
  name: "paragraph",

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },

  group: "block",

  content: "inline*",

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: el => el.getAttribute("id"),
        renderHTML: attrs => ({ id: attrs.id })
      }
    };
  },

  parseHTML() {
    return [{ tag: "p" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addCommands() {
    return {
      setParagraph: id => ({ commands }) => {
        if (id) {
          return commands.setNode(this.name, { id });
        } return commands.setNode(this.name);
      },

      // setComment: uuid => ({ commands }) => {
      //   return commands.toggleNode(this.name, "comments", uuid);
      // }
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-0": () => this.editor.commands.setParagraph()
    };
  }
});
