import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";

const Iframe = Node.create({
  name: "external-video",
  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {
        "data-type": "external-video"
      }
    };
  },
  inline() {
    return this.options.inline;
  },
  group() {
    return this.options.inline ? "inline" : "block";
  },
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: 560
      },
      height: {
        default: 315
      },
      title: {
        default: "Some Test Title"
      },
      frameborder: {
        default: "0"
      },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      },
      allowfullscreen: {
        default: "allowfullscreen"
      },
      loading: {
        default: "lazy"
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'iframe[data-type="external-video"]'
      }
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    ];
  },
  addCommands() {
    return {
      setExternalVideo: (options) => ({ tr, dispatch, editor, commands }) => {
        const node = editor.schema.nodeFromJSON({
          type: "div",
          attrs: { class: "aspect-w-16 aspect-h-9" },
          content: [
            {
              type: this.name,
              attrs: options
            }
          ]
        });
        if (dispatch) {
          tr.replaceSelectionWith(node).scrollIntoView();
        }
        return true;
        /*return commands.insertContent([
                {
                  type: 'div',
                  attrs: { class: 'aspect-w-16 aspect-h-9' },
                  content: [{
                    type: this.name,
                    attrs: options
                  }]
                }
              ]);*/
      }
    };
  }
  /*onUpdate() {
      const transaction = this.editor.state.tr

      this.editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'div' && node.attrs.class == 'aspect-w-16 aspect-h-9') {

          if (node.firstChild !== null && node.firstChild.type.name == 'paragraph') {
            transaction.replaceWith(pos, pos + node.nodeSize, node.content)
            this.editor.view.dispatch(transaction)
            return true
          }

          if (node.childCount == 0) {
            transaction.deleteRange(pos - 1, pos + 1)
            this.editor.view.dispatch(transaction)
            return true
          }

          return false
        }
      })
    }*/
});

export default Iframe;
export { Iframe };
//# sourceMappingURL=tiptap-extension-image.esm.js.map
