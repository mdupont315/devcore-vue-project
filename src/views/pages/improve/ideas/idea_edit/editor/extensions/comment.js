import {
  getMarkRange,
  Node,
  VueNodeViewRenderer,
  mergeAttributes
} from "@tiptap/vue-2";
import { Plugin, TextSelection } from "prosemirror-state";
import CommentNodeView from "./CommentNodeView.vue";


// TODO: find a way to do it internally with the help of appendTransaction so we don't need to
// TODO: do it with help of `onUpdate` hook from TipTap

// const dedupeComments = (editor) => {
//   // const { state: { tr, doc, schema }, view: { dispatch } } = editor as Editor
//   const { state: { tr, doc, schema }, view: { dispatch } } = editor

//   const comments = [];

//   doc.descendants((node, pos) => {
//     if (node.type.name !== "comment") return;

//     comments.push({
//       from: pos,
//       to: pos + node.nodeSize,
//       comment: JSON.parse(node.attrs.comment),
//       shouldDelete: false,
//       content: node.content
//     });
//   });

//   let replaceTransaction = tr

//   for (const comment of comments) {
//     const { from, to, comment: commentData } = comment;

//     const commentsWithSameUuid = comments.filter((c) => c.comment.uuid === commentData.uuid);

//     if (commentsWithSameUuid.length === 1) continue;

//     const commentToRemove = commentsWithSameUuid[0]

//     const newParagraphWithContent = schema.nodes.paragraph.create({}, commentToRemove.content);

//     replaceTransaction = replaceTransaction.replaceRangeWith(from, to, newParagraphWithContent)
//   }

//   dispatch(replaceTransaction)
// }

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
    const { saveContent } = this.options

    return {
      setComment: comment => ({ commands }) => commands.setNode(this.name, { comment }),

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
        },
        // appendTransaction: () => {
        //   // setTimeout(() => dedupeComments(editor));
        // },
      })
    ];

    return plugins;
  },

  addNodeView() {
    return VueNodeViewRenderer(CommentNodeView);
  }
});
