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
import { debounce } from "lodash";
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
const mammoth = require("mammoth");

const dedupeCommentNodes = editor => {
  const {
    state: { doc, tr, schema },
    view: { dispatch }
  } = editor;

  const comments = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== "comment") return;

    const [from, to] = [pos, pos + node.nodeSize];

    const [comment, content] = [JSON.parse(node.attrs.comment), node.content];

    comments.push({ from, to, comment, content });
  });

  const mapOfUuidAndComments = {};

  for (const comment of comments) {
    const uuid = comment.comment.uuid;

    if (mapOfUuidAndComments[uuid]) mapOfUuidAndComments[uuid].push(comment);
    else mapOfUuidAndComments[uuid] = [comment];
  }

  const replaceTr = tr;

  for (const [, comments] of Object.entries(mapOfUuidAndComments).filter(
    ([, c]) => c.length > 1
  )) {
    comments.pop();

    for (const comment of comments) {
      const { from } = comment;

      replaceTr.setNodeMarkup(from, schema.nodes.paragraph);
    }
  }

  dispatch(replaceTr);
};

const debouncedDedupeCommentNodes = debounce(dedupeCommentNodes, 300);

function cleanContentAfterBody(htmlString) {
  const bodyCloseTag = "</body>";
  const htmlCloseTag = "</html>";

  const bodyCloseIndex = htmlString.indexOf(bodyCloseTag);

  if (bodyCloseIndex < 0) {
    return htmlString;
  }

  const htmlCloseIndex = htmlString.indexOf(
    htmlCloseTag,
    bodyCloseIndex + bodyCloseTag.length
  );

  return (
    htmlString.substring(0, bodyCloseIndex + bodyCloseTag.length) +
    (htmlCloseIndex >= 0 ? htmlString.substring(htmlCloseIndex) : "")
  );
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
        removeFile: fileHandlers.removeFile,
        notify: fileHandlers.notify
      }),
      Comment.configure({ saveContent })
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
          // console.log(html)
          // console.log(html);
          //Remove spaces
          // const contents = cleanContentAfterBody(html);
          // console.log(contents);

          // const file = new Blob([JSON.stringify(contents)], {
          //   type: "application/json"
          // });

          // let fileReader = new FileReader(); // not a arguments


          // fileReader.onloadend = function(event) {
          //   const arrayBuffer = fileReader.result;
          //   console.log("reading");
          //   console.log(arrayBuffer)
          //   mammoth
          //     .convertToHtml({ arrayBuffer: arrayBuffer })
          //     .then(function(resultObject) {
          //       console.log("resultObject.value");
          //       console.log(resultObject.value);
          //     });
          // };

          // fileReader.readAsArrayBuffer(file);

          // let blob = new Blob([contents], {
          //   type:
          //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          // });

          // async function blobToArrayBuffer(blob) {
          //   if ("arrayBuffer" in blob) return await blob.arrayBuffer();

          //   return new Promise((resolve, reject) => {
          //     const reader = new FileReader();
          //     reader.onload = () => resolve(reader.result);
          //     reader.onerror = () => reject;
          //     reader.readAsArrayBuffer(blob);
          //   });
          // }

          // await blobToArrayBuffer(blob).then(arrayBuffer => {
          //   mammoth.extractRawText({ arrayBuffer }, {}).then(docx => {
          //     console.log("最终结果：", docx);
          //   });
          // });

          // reader.onloadend = function() {
          //   const arrayBuffer = reader.result;
          //   console.log("reading")
          //   mammoth
          //     .convertToHtml({ arrayBuffer: arrayBuffer })
          //     .then(function(resultObject) {
          //       console.log("resultObject.value");
          //       console.log(resultObject.value);
          //     });
          // };

          const formatHTML = html.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          const __formatHTML = _formatHTML.replace(/ style(.*?)">/g, ">");
          const ___formatHTML = __formatHTML.replace(/<br>/g, " ");

          console.log(html)

         // console.log(_stylesRemoved)
          return ___formatHTML;
        }
        // transformPastedHTML(html) {
        //   console.log(html);
        //   // 1. remove line breaks / Mso classes
        //   let stringStripper = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
        //   let output = html.replace(stringStripper, " ");
        //   // 2. strip Word generated HTML comments
        //   let commentSripper = new RegExp("<!--(.*?)-->", "g");
        //   output = output.replace(commentSripper, "");
        //   let tagStripper = new RegExp(
        //     "<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>",
        //     "gi"
        //   );
        //   // 3. remove tags leave content if any
        //   output = output.replace(tagStripper, "");
        //   // 4. Remove everything in between and including tags '<style(.)style(.)>'
        //   let badTags = [
        //     "style",
        //     "script",
        //     "applet",
        //     "embed",
        //     "noframes",
        //     "noscript"
        //   ];

        //   for (let i = 0; i < badTags.length; i++) {
        //     tagStripper = new RegExp(
        //       "<" + badTags[i] + ".*?" + badTags[i] + "(.*?)>",
        //       "gi"
        //     );
        //     output = output.replace(tagStripper, "");
        //   }
        //   // 5. remove attributes ' style="..."'
        //   let badAttributes = ["start", "style"];
        //   for (let i = 0; i < badAttributes.length; i++) {
        //     let attributeStripper = new RegExp(
        //       " " + badAttributes[i] + '="(.*?)"',
        //       "gi"
        //     );
        //     output = output.replace(attributeStripper, "");
        //   }

        //   console.log(output);
        //   //    console.log(output)
        //   return output.replace(/&nbsp;/g, " ");
        // }
        //   transformPastedHTML(html) {
        //     // const htmlBuffer = Buffer.from(html);
        //     // const arrayBuffer = htmlBuffer.buffer.slice(
        //     //   htmlBuffer.byteOffset,
        //     //   htmlBuffer.byteOffset + htmlBuffer.byteLength
        //     // );

        //     // console.log(arrayBuffer);

        //     // const convertedHtml = mammoth.extractRawText({ arrayBuffer });
        //     // console.log(convertedHtml)

        //     // console.log(convertedHtml);
        //   //  console.log(html)
        //   //   let str = html.replace(/<o:p>\s*<\/o:p>/g, "");
        //   //   console.log(html)
        //   //   str = str.replace(/<o:p>.*?<\/o:p>/g, "&nbsp;");
        //   //   str = str.replace(/\s*mso-[^:]+:[^;"]+;?/gi, "");
        //   //   str = str.replace(/\s*MARGIN: 0cm 0cm 0pt\s*;/gi, "");
        //   //   str = str.replace(/\s*MARGIN: 0cm 0cm 0pt\s*"/gi, '"');
        //   //   str = str.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, "");
        //   //   str = str.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, '"');
        //   //   str = str.replace(/\s*TEXT-ALIGN: [^\s;]+;?"/gi, '"');
        //   //   str = str.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, '"');
        //   //   str = str.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, '"');
        //   //   str = str.replace(/\s*tab-stops:[^;"]*;?/gi, "");
        //   //   str = str.replace(/\s*tab-stops:[^"]*/gi, "");
        //   //   str = str.replace(/\s*face="[^"]*"/gi, "");
        //   //   str = str.replace(/\s*face=[^ >]*/gi, "");
        //   //   str = str.replace(/\s*FONT-FAMILY:[^;"]*;?/gi, "");
        //   //   str = str.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3");
        //   //   str = str.replace(/<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3");
        //   //   str = str.replace(/\s*style="\s*"/gi, "");
        //   //   str = str.replace(/<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, "&nbsp;");
        //   //   str = str.replace(/<SPAN\s*[^>]*><\/SPAN>/gi, "");
        //   //   str = str.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");
        //   //   str = str.replace(/<SPAN\s*>(.*?)<\/SPAN>/gi, "$1");
        //   //   str = str.replace(/<FONT\s*>(.*?)<\/FONT>/gi, "$1");
        //   // //  str = str.replace(/<\/?span[^>]*>/g,"");
        //   // //  str = str.replace(/<span>;/g, "");

        //   //   str = str.replace(/<\\?\?xml[^>]*>/gi, "");
        //   //   str = str.replace(/<\/?\w+:[^>]*>/gi, "");
        //   //   str = str.replace(/<H\d>\s*<\/H\d>/gi, "");
        //   //   str = str.replace(/<H1([^>]*)>/gi, "");
        //   //   str = str.replace(/<H2([^>]*)>/gi, "");
        //   //   str = str.replace(/<H3([^>]*)>/gi, "");
        //   //   str = str.replace(/<H4([^>]*)>/gi, "");
        //   //   str = str.replace(/<H5([^>]*)>/gi, "");
        //   //   str = str.replace(/<H6([^>]*)>/gi, "");
        //   //   str = str.replace(/<\/H\d>/gi, "<br>"); //remove this to take out breaks where Heading tags were
        //   //   str = str.replace(/<(U|I|STRIKE)>&nbsp;<\/\1>/g, "&nbsp;");
        //   //   str = str.replace(/<(B|b)>&nbsp;<\/\b|B>/g, "");
        //   //   str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, "");
        //   //   str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, "");
        //   //   str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, "");
        //   //   //some RegEx code for the picky browsers
        //   //   var re = new RegExp("(<P)([^>]*>.*?)(</P>)", "gi");
        //   //   str = str.replace(re, "<div$2</div>");
        //   //   var re2 = new RegExp(
        //   //     "(<font|<FONT)([^*>]*>.*?)(</FONT>|</font>)",
        //   //     "gi"
        //   //   );
        //   //   str = str.replace(re2, "<div$2</div>");
        //   //   str = str.replace(/size|SIZE = ([\d]{1})/g, "");

        //     //Remove spaces
        //     const formatHTML = html.replace(/&nbsp;/g, " ")
        //     console.log(formatHTML)
        //     // const formatHTML = html.replace(/&nbsp;/g, "<br class="ProseMirror-trailingBreak" />);
        //  // console.log(html)

        //     //console.log(formatHTML)

        //     //Remove comments
        //     const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");

        //     return _formatHTML;
        //   }
      },

      onTransaction({ editor, transaction }) {
     //   console.log(transaction)
        // console.log("transaction")
        // console.log(transaction)
        // if (!this.dedupedCommentNodes) {
        //   this.dedupedCommentNodes = true;
        // }
        // this.dedupedCommentNodes = false;
      },

      onUpdate: ({ editor }) => {
        setTimeout(() => {
          if (!this.dedupedCommentNodes) {
            this.dedupedCommentNodes = true;

            if (editor.isActive("comment")) {
              setTimeout(() =>
                setTimeout(() => debouncedDedupeCommentNodes(editor))
              );
            }
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
