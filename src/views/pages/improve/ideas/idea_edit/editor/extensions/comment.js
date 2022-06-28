import { Node, VueNodeViewRenderer, mergeAttributes } from "@tiptap/vue-2";
import { TextSelection } from "prosemirror-state";
import CommentNodeView from "./CommentNodeView.vue";

export const Comment = Node.create({
  name: "comment",

  group: "block",

  content: "text*",

  addOptions() {
    return {
      HTMLAttributes: {},
      isCommentModeOn: () => false,
      saveContent: () => {},
      dedupeComments: () => {},
      transformComments: () => {}
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

  parseHTML: () => [{ tag: "span[comment]" }],

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0
    ];
  },

  addCommands() {
    const { saveContent, dedupeComments, transformComments } = this.options;

    return {
      setComment: comment => ({ commands }) =>
        commands.setNode(this.name, { comment }),

      saveReply: ideaUUID => ({ commands }) => saveContent(ideaUUID),
      dedupeComments: node => ({ commands }) => dedupeComments(node),
      transformComments: node => ({ commands }) => transformComments(node),

      scrollToNextComment: () => ({ commands }) => {
        const editor = this.editor;

        const {
          state: { doc, tr, selection },
          view: { dispatch }
        } = editor;

        const { from: selectionFrom, to: selectionTo } = selection;

        const commentNodes = [];

        doc.descendants((node, pos) => {
          if (node.type.name !== "comment") return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          commentNodes.push({ nodeFrom, nodeTo });
        });

        let focusNextCommentNode = false;
        let coordsOfCommentToFocus = null;

        for (const commentNode of commentNodes) {
          const { nodeFrom, nodeTo } = commentNode;

          if (focusNextCommentNode) {
            coordsOfCommentToFocus = commentNode;
            break;
          }

          const isSelectionInsideCommentNode =
            nodeFrom <= selectionFrom && selectionTo <= nodeTo + 1;

          focusNextCommentNode = isSelectionInsideCommentNode;
        }

        if (commentNodes.length === 0) return;

        if (!coordsOfCommentToFocus && commentNodes.length) {
          coordsOfCommentToFocus = commentNodes[0];
        }

        const { nodeFrom, nodeTo } = coordsOfCommentToFocus;

        const [$from, $to] = [doc.resolve(nodeFrom + 1), doc.resolve(nodeTo)];
        const sel = new TextSelection($from, $to);

        dispatch(tr.setSelection(sel).scrollIntoView());

        setTimeout(() => {
          const selCommentStart = new TextSelection($from);

          dispatch(tr.setSelection(selCommentStart));
        }, 100);
      }
    };
  },

  addKeyboardShortcuts: () => {
    return {
      Backspace: ({ editor }) => {
        if (editor && editor.isActive("comment")) {

          editor.commands.first(({ commands }) => [
            () => commands.deleteSelection(),
            () => commands.joinBackward(),
            () => commands.deleteCharBefore()
          ]);

          return true;
        }
        return false;
      }
    };
  },
  // addKeyboardShortcuts: () => {
  //   return {
  //     Backspace: ({ editor }) => {
  //       const {
  //         state: {
  //           doc,
  //           selection: { from: selFrom, to: selTo },
  //           schema,
  //           tr
  //         },
  //         view: { dispatch }
  //       } = editor;

  //       let [commentNode, nodeBeforeCommentNode, lastNode] = new Array(3).fill(
  //         null
  //       );

  //       doc.descendants((node, pos) => {
  //         if (!node.isBlock || commentNode) return;

  //         if (node.type.name === "comment") {
  //           const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

  //           const isNodeActiveCommentNode =
  //             nodeFrom <= selFrom && selTo <= nodeTo;

  //           if (isNodeActiveCommentNode) {
  //             commentNode = { node, from: pos, to: pos + node.nodeSize };
  //             nodeBeforeCommentNode = lastNode;
  //           }
  //         } else {
  //           lastNode = {
  //             node,
  //             from: pos,
  //             to: pos + node.nodeSize,
  //             isEmpty: !node.textContent.length
  //           };
  //         }
  //       });

  //       if (
  //         commentNode &&
  //         nodeBeforeCommentNode &&
  //         selFrom === commentNode.from + 1 &&
  //         selTo === commentNode.from + 1
  //       ) {
  //         const beforeContent = nodeBeforeCommentNode.node.content;
  //         const commentContent = commentNode.node.content;

  //         const combinedContent = beforeContent.append(commentContent);

  //         const newCommentWithCombinedContent = schema.nodes.comment.create(
  //           commentNode.node.attrs,
  //           combinedContent
  //         );

  //         let replaceTr = tr.replaceRangeWith(
  //           nodeBeforeCommentNode.from,
  //           commentNode.to - 2,
  //           newCommentWithCombinedContent
  //         );

  //         dispatch(replaceTr);

  //         setTimeout(() => {
  //           if (nodeBeforeCommentNode.isEmpty) {
  //             const focusPos = editor.state.doc.resolve(
  //               nodeBeforeCommentNode.from
  //             );

  //             const newSel = new TextSelection(focusPos);

  //             editor.view.dispatch(editor.state.tr.setSelection(newSel));
  //           }
  //         }, 100);
  //       } else {
  //         const resolvedPos = doc.resolve(selFrom);

  //         const newSel = new TextSelection(resolvedPos);

  //         dispatch(tr.setSelection(newSel));
  //       }

  //       //   if (editor && editor.isActive("comment")) {
  //       //   //  editor.commands.clearNodes();
  //       //     editor.commands.first(({ commands }) => [
  //       //  //     () => commands.undoInputRule(),
  //       //       () => commands.deleteSelection(),
  //       //       () => commands.joinBackward(),
  //       //       () => commands.selectNodeBackward()
  //       //     ]);
  //       //   }
  //       return false;

  //       //   console.log("creaíng!");
  //       //  // editor.commands.clearNodes();

  //       //   // Backspace: ({ editor }) => {
  //       //   const {
  //       //     state: {
  //       //       doc,
  //       //       selection: { from: selFrom, to: selTo },
  //       //       schema,
  //       //       tr
  //       //     },
  //       //     view: { dispatch }
  //       //   } = editor;

  //       //   let [commentNode, nodeBeforeCommentNode, lastNode] = new Array(3).fill(
  //       //     null
  //       //   );

  //       //   doc.descendants((node, pos) => {
  //       //     if (!node.isBlock || commentNode) return;

  //       //     if (node.type.name === "comment") {
  //       //       const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

  //       //       const isNodeActiveCommentNode =
  //       //         nodeFrom <= selFrom && selTo <= nodeTo;

  //       //       if (isNodeActiveCommentNode) {
  //       //         commentNode = { node, from: pos, to: pos + node.nodeSize };
  //       //         nodeBeforeCommentNode = lastNode;
  //       //       }
  //       //     } else {
  //       //       lastNode = {
  //       //         node,
  //       //         from: pos,
  //       //         to: pos + node.nodeSize,
  //       //         isEmpty: !node.textContent.length
  //       //       };
  //       //     }
  //       //   });

  //       //   if (
  //       //     commentNode &&
  //       //     nodeBeforeCommentNode &&
  //       //     selFrom === commentNode.from + 1 &&
  //       //     selTo === commentNode.from + 1
  //       //   ) {
  //       //     const beforeContent = nodeBeforeCommentNode.node.content;
  //       //     const commentContent = commentNode.node.content;

  //       //     const combinedContent = beforeContent.append(commentContent);

  //       //     const newCommentWithCombinedContent = schema.nodes.comment.create(
  //       //       commentNode.node.attrs,
  //       //       combinedContent
  //       //     );

  //       //     let replaceTr = tr.replaceRangeWith(
  //       //       nodeBeforeCommentNode.from,
  //       //       commentNode.to - 2,
  //       //       newCommentWithCombinedContent
  //       //     );

  //       //     console.log(replaceTr);
  //       //     dispatch(replaceTr);

  //       //     setTimeout(() => {
  //       //       if (nodeBeforeCommentNode.isEmpty) {
  //       //         const focusPos = editor.state.doc.resolve(
  //       //           nodeBeforeCommentNode.from
  //       //         );

  //       //         const newSel = new TextSelection(focusPos);

  //       //         editor.view.dispatch(editor.state.tr.setSelection(newSel));
  //       //       }
  //       //     }, 100);
  //       //   } else {
  //       //     const resolvedPos = doc.resolve(selFrom);

  //       //     const newSel = new TextSelection(resolvedPos);

  //       //     dispatch(tr.setSelection(newSel));
  //       //   }
  //     }
  //   };
  // },

  addNodeView: () => VueNodeViewRenderer(CommentNodeView)
});
