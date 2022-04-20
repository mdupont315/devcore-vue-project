import {
  getMarkRange,
  Node,
  VueNodeViewRenderer,
  mergeAttributes
} from "@tiptap/vue-2";
import { Plugin, TextSelection } from "prosemirror-state";
import CommentNodeView from "./CommentNodeView.vue";

export const Comment = Node.create({
  name: "comment",

  group: "block",

  content: "text*",

  addOptions() {
    return {
      HTMLAttributes: {},
      isCommentModeOn: () => false
    };
  },

  addAttributes() {
    return {
      comment: {
        default: null,
        parseHTML: el => el.getAttribute("comment"),
        renderHTML: attrs => ({ comment: attrs.comment })
      }
    };
  },

  parseHTML() {
    return [{ tag: "span[comment]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addCommands() {
    return {
      setComment: comment => ({ commands }) => {
        console.log(comment);
        return commands.setNode(this.name, { comment });
      },
      unsetComment: (comment, removeId) => ({ commands, state }) => {
        console.log(comment);
        console.log(removeId);
        console.log("UNSETTING");

        const { selection } = state;
        const { from: selectionFrom, to: selectionTo } = selection;

        console.log(selectionFrom, selectionTo)

       // commands.updateAttributes("comment", { replied: true });
        // return commands.setNode(this.name, {
        //   comment: newComments
        // });
      }

      // setComment: (comment) => ({ commands }) => commands.setNode('comment', { comment }),
      // toggleComment: () => ({ commands }) => commands.toggleMark('comment'),
      // unsetComment: () => ({ commands }) => commands.unsetMark('comment'),
    };
  },

  addProseMirrorPlugins() {
    const { options } = this;

    const plugins = [
      new Plugin({
        props: {
          handleClick(view, pos) {
            if (!options.isCommentModeOn()) return false;

            const { schema, doc, tr } = view.state;

            const range = getMarkRange(doc.resolve(pos), schema.marks.comment);

            if (!range) return false;

            const [$start, $end] = [
              doc.resolve(range.from),
              doc.resolve(range.to)
            ];

            view.dispatch(tr.setSelection(new TextSelection($start, $end)));

            return true;
          }
        }
      })
    ];

    return plugins;
  },

  addNodeView() {
    return VueNodeViewRenderer(CommentNodeView);
  }
});
