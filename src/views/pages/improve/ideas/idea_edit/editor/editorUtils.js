const transformProcessedCommentNodesToParagraph = (editor) => {
  const comments = [];

  const {
    state: { doc, tr, schema },
    view: { dispatch },
  } = editor;

  doc.descendants((node, pos) => {
    if (node.type.name !== "comment") return;

    comments.push({
      from: pos,
      to: pos + node.nodeSize,
      comment: JSON.parse(node.attrs.comment),
      shouldDelete: false,
      content: node.content,
    });
  });

  for (const comment of comments) {
    const { from, to, comment: commentData } = comment;

    const shouldRemoveComment = !commentData.comments.length;

    if (!shouldRemoveComment) continue;

    const newParagraphWithContent = schema.nodes.paragraph.create(
      {},
      comment.content
    );

    const replaceTransaction = tr.replaceRangeWith(
      from,
      to,
      newParagraphWithContent
    );

    dispatch(replaceTransaction);
  }
}

export {
  transformProcessedCommentNodesToParagraph
}
