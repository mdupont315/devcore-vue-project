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

// import HardBreak from "@tiptap/extension-hard-break";
import { Color } from "@tiptap/extension-color";
import { debounce } from "lodash";
import {
  Indent,
  EventHandler,
  Heading,
  CustomTable,
  File,
  Comment,
  ExternalVideo,
  //Paragraph,
  TrailingNode
} from "./extensions";

// const dedupeComments = editor => {
//   const {
//     state: { doc, tr, schema },
//     view: { dispatch }
//   } = editor;

//   const comments = [];

//   doc.descendants((node, pos) => {
//     if (node.type.name !== "comment") return;

//     const [from, to] = [pos, pos + node.nodeSize];

//     const [comment, content] = [JSON.parse(node.attrs.comment), node.content];

//     comments.push({ from, to, comment, content });
//   });

//   console.log(comments);

//   comments.forEach((comment, index) => {
//     // console.log(index);
//     // console.log(comment);
//     if (comment && comments[index + 1]) {
//       const curComment = comment;
//       const nextComment = comments[index + 1];

//       const sameUuid = curComment.comment.uuid === nextComment.comment.uuid;
//       const sameNode = curComment.to === nextComment.from;

//       console.log(curComment);
//       console.log(nextComment);
//       return;

//       if (sameUuid && sameNode) {
//         console.log("IS SAME!");
//         console.log(curComment);
//         console.log(nextComment);
//         curComment.comment.comments = [];
//         const emptyComment = {
//           comment: JSON.stringify({ ...curComment.comment, comments: [] }),
//           uuid: curComment.comment.uuid,
//           visible: false
//         };
//         console.log(emptyComment);
//         let replaceTr = tr.setNodeMarkup(
//           curComment.from,
//           undefined,
//           emptyComment
//         );
//         dispatch(replaceTr);
//       }

// console.log(sameUuid);
// console.log(sameParent);
// if (sameUuid && sameParent) {
//   editor.commands.setNode("comment", {});
//   //editor.commands.setComment(JSON.stringify(dataToInsert));
// }
// const mapOfUuidAndComments = {};

// for (const comment of comments) {
//   const uuid = comment.comment.uuid;

//   if (mapOfUuidAndComments[uuid]) mapOfUuidAndComments[uuid].push(comment);
//   else mapOfUuidAndComments[uuid] = [comment];
// }

// const replaceTr = tr;

// for (const [, comments] of Object.entries(mapOfUuidAndComments).filter(
//   ([, c]) => c.length > 1
// )) {
//   comments.pop();

//   for (const comment of comments) {
//     const { from } = comment;

//     replaceTr.setNodeMarkup(from, schema.nodes.paragraph);
//   }
// }

// dispatch(replaceTr);
//     }
//   });
// };

// const dedupeCommentNodes = editor => {
//   const {
//     state: { doc, tr, schema },
//     view: { dispatch }
//   } = editor;

//   const comments = [];

//   doc.descendants((node, pos) => {
//     if (node.type.name !== "comment") return;

//     const [from, to] = [pos, pos + node.nodeSize];

//     const [comment, content] = [JSON.parse(node.attrs.comment), node.content];

//     comments.push({ from, to, comment, content });
//   });

//   const mapOfUuidAndComments = {};

//   for (const comment of comments) {
//     const uuid = comment.comment.uuid;

//     if (mapOfUuidAndComments[uuid]) mapOfUuidAndComments[uuid].push(comment);
//     else mapOfUuidAndComments[uuid] = [comment];
//   }

//   const replaceTr = tr;

//   for (const [, comments] of Object.entries(mapOfUuidAndComments).filter(
//     ([, c]) => c.length > 1
//   )) {
//     comments.pop();

//     for (const comment of comments) {
//       const { from } = comment;

//       replaceTr.setNodeMarkup(from, schema.nodes.paragraph);
//     }
//   }

//   dispatch(replaceTr);
// };

//const debounceCommentNodes = debounce(dedupeComments, 300);

//const debouncedDedupeCommentNodes = debounce(dedupeCommentNodes, 300);

// function cleanContentAfterBody(htmlString) {
//   const bodyCloseTag = "</body>";
//   const htmlCloseTag = "</html>";

//   const bodyCloseIndex = htmlString.indexOf(bodyCloseTag);

//   if (bodyCloseIndex < 0) {
//     return htmlString;
//   }

//   const htmlCloseIndex = htmlString.indexOf(
//     htmlCloseTag,
//     bodyCloseIndex + bodyCloseTag.length
//   );

//   return (
//     htmlString.substring(0, bodyCloseIndex + bodyCloseTag.length) +
//     (htmlCloseIndex >= 0 ? htmlString.substring(htmlCloseIndex) : "")
//   );
// }
export default class ContentEditor {
  constructor(
    editable,
    value,
    options,
    fileHandlers,
    saveContent,
    commentHandlers
  ) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.fileHandlers = fileHandlers;
    this.extensions = [
      StarterKit.configure({
        history: false
        // paragraph: false
        // hardBreak: false
      }),
      // Paragraph,
      // HardBreak.extend({
      //   addKeyboardShortcuts() {
      //     return {
      //       "Mod-Enter": () => this.editor.commands.addNewLine(),
      //       "Shift-Enter": () => this.editor.commands.addNewLine()
      //     };
      //   }
      // }),
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
        removeFile: fileHandlers.removeFile,
        notify: fileHandlers.notify
      }),
      Comment.configure({
        saveContent,
        ...commentHandlers
      })
    ];
    this.editor = this.getEditorInstance();
    this.dedupedCommentNodes = false;
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      editorProps: {
        attributes: {
          id: "idea-edit-editor-container"
        },
        transformPastedText(text) {
          //Remove spaces
          //  console.log(text);
          const formatHTML = text.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          // console.log(_formatHTML)
          return _formatHTML;
        },
        transformPastedHTML(html) {
          const formatHTML = html.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          const __formatHTML = _formatHTML.replace(/ style(.*?)">/g, ">");
          const ___formatHTML = __formatHTML.replace(/<br>/g, " ");

          console.log(html);

          // console.log(_stylesRemoved)
          return ___formatHTML;
        }
      },

      onUpdate: ({ editor }) => {
        setTimeout(() => {
          if (!this.dedupedCommentNodes) {
            this.dedupedCommentNodes = true;

            if (editor && editor.isActive("comment")) {
              setTimeout(() => {
                this.editor.commands.transformComments(this.node);
              }, 300);
            }
            // if (editor.isActive("comment")) {
            //   setTimeout(() =>
            //     // setTimeout(() => debouncedDedupeCommentNodes(editor))
            // //    setTimeout(() => debounceCommentNodes(editor))
            //   );
            // }
          }

          this.dedupedCommentNodes = false;

          const json = editor.getJSON();

          this.options.onUpdate(json);
        });
      }

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
