import { Plugin, PluginKey } from "prosemirror-state";

export function paragraphTransformer(options) {
  return new Plugin({
    key: new PluginKey("paragraphTransformerPlugin"),
    props: {
      decorations(state) {
        return this.getState(state);
      }
    },
    appendTransaction: (transactions, state, newState) => {
      const docChanges =
        transactions.some(transaction => transaction.docChanged) &&
        !state.doc.eq(newState.doc);
      const savingComment = transactions.some(transaction =>
        transaction.getMeta("saveComment")
      );

      if (!docChanges || savingComment) {
        return;
      }

      const { tr } = newState;

      const comments = [];
      newState.doc.descendants((node, pos) => {
        if (node.type.name !== "comment") return;

        comments.push({
          from: pos,
          to: pos + node.nodeSize,
          comment: JSON.parse(node.attrs.comment),
          shouldDelete: false,
          content: node.content
        });
      });
      const hasEmptyComment = comments.some(
        commentNode => commentNode.comment.comments.length === 0
      );
      if (!hasEmptyComment) return;

      for (const comment of comments) {
        const { from, to, comment: commentData } = comment;

        const shouldRemoveComment = !commentData.comments.length;

        if (!shouldRemoveComment) continue;

        const newParagraphWithContent = newState.schema.nodes.paragraph.create(
          {},
          comment.content
        );

        const replaceTransaction = tr.replaceRangeWith(
          from,
          to,
          newParagraphWithContent
        );
        return replaceTransaction;
      }
    }
  });
}
