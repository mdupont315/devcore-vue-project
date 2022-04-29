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
      isCommentModeOn: () => false,
      saveContent: () => {}
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
    const { saveContent } = this.options;
    return {
      setComment: comment => ({ commands }) =>
        commands.setNode(this.name, { comment }),

      saveReply: () => () => saveContent()
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
