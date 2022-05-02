import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Gapcursor from "@tiptap/extension-gapcursor";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import History from "@tiptap/extension-history";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import {
  Indent,
  EventHandler,
  Heading,
  CustomTable,
  File,
  Comment,
  ExternalVideo,
  TrailingNode
} from "./extensions";

const dedupeCommentNodes = (editor) => {
  const { state: { doc, tr, schema }, view: { dispatch } } = editor;

  const comments = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== "comment") return;

    comments.push({
      from: pos,
      to: pos + node.nodeSize,
      comment: JSON.parse(node.attrs.comment),
      shouldDelete: false,
      content: node.content
    });
  });

  for (const comment of comments) {
    const { from, to, comment: commentData } = comment;

    const commentsWithSameUuid = comments.filter((c) => c.comment.uuid === commentData.uuid);

    if (commentsWithSameUuid.length === 1) continue;

    const commentToRemove = commentsWithSameUuid[0]

    let replaceTransaction = tr

    const newParagraphWithContent = schema.nodes.paragraph.create({}, commentToRemove.content);

    replaceTransaction = replaceTransaction.replaceRangeWith(from, to, newParagraphWithContent)

    dispatch(replaceTransaction)
  }
}


export default class ContentEditor {
  constructor(editable, value, options, fileHandlers, saveContent) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.fileHandlers = fileHandlers;
    this.extensions = [
      StarterKit.configure({
        history: false
      }),
      History.configure({ depth: 10 }),
      FontFamily.configure({
        types: ["textStyle"]
      }),
      Text,
      // Draggable,
      Link.configure({
        HTMLAttributes: { target: "_blank" },
        linkOnPaste: false,
        openOnClick: true
      }),
      TextStyle,
      Color,
      Indent,
      Highlight,
      ExternalVideo,
      Underline,
      TableRow,
      TableHeader,
      TableCell,
      Gapcursor,
      Heading,
      CustomTable,
      EventHandler,
      TrailingNode,
      File.configure({
        addFile: fileHandlers.addFile,
        removeFile: fileHandlers.removeFile
      }),
      Comment.configure({ saveContent })
    ];
    this.editor = this.getEditorInstance();
    this.dedupedCommentNodes = false
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      editorProps: {
        transformPastedText(text) {
          //Remove spaces
          console.log(text)
          const formatHTML = text.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          return _formatHTML;
        },
        transformPastedHTML(html) {

          console.log(html)
          //Remove spaces
          const formatHTML = html.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");

          return _formatHTML;
        }
      },
      onUpdate: ({ editor }) => {
        setTimeout(() => {
          if (!this.dedupedCommentNodes) {
            this.dedupedCommentNodes = true

            if (editor.isActive('comment')) setTimeout(() => dedupeCommentNodes(editor))
          }

          this.dedupedCommentNodes = false

          const json = editor.getJSON();

          this.options.onUpdate(json);
        });
      },
      // onFocus: ({ editor }) => {
      //   const json = editor.getJSON();
      //   this.options.onUpdate(json);
      // }
    });
  }

  *getExtensions() {
    for (const extension of this.extensions) {
      yield extension;
    }
  }

  get EditorInstance() {
    return this.editor;
  }
}
