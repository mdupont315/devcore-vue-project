import { Node, mergeAttributes, textblockTypeInputRule } from "@tiptap/core";

export const Heading = Node.create({
  name: "heading",

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {}
    };
  },

  content: "inline*",

  group: "block",

  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false
      }
    };
  },

  parseHTML() {
    return this.options.levels.map(level => ({
      tag: `h${level}`,
      attrs: { level }
    }));
  },

  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: {
            default: "heading-"
          }
        }
      }
    ];
  },

  renderHTML({ node, HTMLAttributes, view }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];
    HTMLAttributes.id = "heading-" + this.storage.counter;

    if (!level || level > 3) {
      return [
        `p`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0
      ];
    }

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addNodeView() {
    return ({ editor, node }) => {
      const heading = document.createElement("h1");
      const headings = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          headings.push({
            level: node.attrs.level,
            text: node.textContent,
            id: heading.id
          });
        }
      });

      heading.innerHTML = node.textContent;

      if (headings.length > this.storage.counter) {
        this.storage.counter += 1;
      } else {
        this.storage.counter = 1;
      }

      return {
        heading
      };
    };
  },

  addStorage() {
    return {
      counter: 0
    };
  },

  addCommands() {
    return {
      setHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.setNode(this.name, attributes);
      },
      toggleHeading: attributes => ({ commands }) => {
        if (!this.options.levels.includes(attributes.level)) {
          return false;
        }

        return commands.toggleNode(this.name, "paragraph", attributes);
      }
    };
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Mod-Alt-${level}`]: () =>
            this.editor.commands.toggleHeading({ level })
        }
      }),
      {}
    );
  },

  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level
        }
      });
    });
  }
});
