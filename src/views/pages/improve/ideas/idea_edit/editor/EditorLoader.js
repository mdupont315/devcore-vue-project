import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Gapcursor from "@tiptap/extension-gapcursor";
import TableRow from "@tiptap/extension-table-row";
//import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import History from "@tiptap/extension-history";
import FontFamily from "@tiptap/extension-font-family";
import ListItem from "@tiptap/extension-list-item";
import Typography from "@tiptap/extension-typography";
import Italic from "@tiptap/extension-italic";
import Bold from "@tiptap/extension-bold";
import { Color } from "@tiptap/extension-color";
import {
  Indent,
  EventHandler,
  Heading,
  CustomTableCell,
  CustomTable,
  File,
  Comment,
  ExternalVideo,
  Paragraph,
  TrailingNode,
  CustomLink,
  CustomUnderLine,
  FocusNode,
  Position
} from "./extensions";
const URL_INCLUDE_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
const URL_EXCLUDE_REGEX = /.*@.*/;

function findImageNodeIndexInChildren(element) {
  for (let i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes.item(i).nodeName === "IMG") {
      return i;
    }
  }
  return null;
}

function processImageNode(image) {
  console.log(image);
  const parent = image.parentElement;
  const grandParent = parent?.parentElement;
  if (!parent || !grandParent) return;

  console.log(parent.nodeName);
  console.log(grandParent.nodeName);
  if (parent.nodeName === "SPAN" && grandParent.nodeName === "P") {
    let imageIndex = findImageNodeIndexInChildren(parent);
    if (imageIndex === null) return;
    // Move all nodes before the image in a parent before the current one
    if (imageIndex > 1) {
      const pBefore = document.createElement(parent.nodeName);
      grandParent.insertBefore(pBefore, parent);
      for (; imageIndex > 0; imageIndex--) {
        pBefore.append(parent.childNodes.item(0));
      }
    }
    // Move the image before the current parent
    const imageNode = parent.childNodes.item(0);
    grandParent.insertBefore(imageNode, parent);
    // If the old parent is now empty, delete it
    if (parent.childNodes.length === 0) {
      grandParent.removeChild(parent);
    }
  } else {
    console.log(parent);
    parent.replaceWith(image);
  }
}

// function unwrapImages(htmlString) {
//   const div = document.createElement("div");
//   div.className = "root";
//   div.innerHTML = htmlString;

//   // Security to not loop too deep
//   let maxLevel = 5;
//   let images;
//   do {
//     images = div.querySelectorAll("*:not(.root) > img");
//     console.log(images);
//     for (let i = 0; i < images.length; i++) {
//       // console.log(images[i])
//       images[i].parentElement.setAttribute("contenteditable", false);
//       //  processImageNode(images[i]);
//     }
//     maxLevel--;
//   } while (maxLevel > 0 && images.length > 0);
//   return div.innerHTML;
// }

// function normalizeSafariSpaceSpans(htmlString) {
//   return htmlString.replace(
//     /<span(?: class="Apple-converted-space"|)>(\s+)<\/span>/g,
//     (fullMatch, spaces) => {
//       return spaces.length === 1
//         ? " "
//         : Array(spaces.length + 1)
//             .join("\u00A0 ")
//             .substr(0, spaces.length);
//     }
//   );
// }

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

// const normalizeSpacerunSpans = htmlDocument => {
//   htmlDocument.querySelectorAll("span[style*=spacerun]").forEach(el => {
//     const innerTextLength = el.innerText.length || 0;

//     el.innerText = Array(innerTextLength + 1)
//       .join("\u00A0 ")
//       .substr(0, innerTextLength);
//   });
// };

// const normalizeSpacing = htmlString => {
//   // Run normalizeSafariSpaceSpans() two times to cover nested spans.
//   return (
//     normalizeSafariSpaceSpans(normalizeSafariSpaceSpans(htmlString))
//       // Remove all \r\n from "spacerun spans" so the last replace line doesn't strip all whitespaces.
//       .replace(
//         /(<span\s+style=['"]mso-spacerun:yes['"]>[^\S\r\n]*?)[\r\n]+([^\S\r\n]*<\/span>)/g,
//         "$1$2"
//       )
//       .replace(/<span\s+style=['"]mso-spacerun:yes['"]><\/span>/g, "")
//       .replace(/ <\//g, "\u00A0</")
//       .replace(/ <o:p><\/o:p>/g, "\u00A0<o:p></o:p>")
//       // Remove <o:p> block filler from empty paragraph. Safari uses \u00A0 instead of &nbsp;.
//       .replace(/<o:p>(&nbsp;|\u00A0)<\/o:p>/g, "")
//       // Remove all whitespaces when they contain any \r or \n.
//       .replace(/>([^\S\r\n]*[\r\n]\s*)</g, "><")
//   );
// };

// const parseDocxHTml = htmlString => {
//   console.log("^^^^^^^^^^^^^^^^^BEFORE^^^^^^^^^^");
//   console.log(htmlString);
//   const domParser = new DOMParser();
//   const normalizedHtml = normalizeSpacing(cleanContentAfterBody(htmlString));
//   const htmlDocument = domParser.parseFromString(normalizedHtml, "text/html");

//   normalizeSpacerunSpans(htmlDocument);

//   const bodyString = htmlDocument.body.innerHTML;

//   console.log("***************ÂFTER***************");
//   console.log(bodyString);
//   console.log("***************AFTER***************");
//   return normalizedHtml;
// };

export default class ContentEditor {
  constructor(
    editable,
    value,
    options,
    fileHandlers,
    saveContent,
    commentHandlers,
    linkHandlers,
    tableHandlers
  ) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.fileHandlers = fileHandlers;
    this.tableHandlers = tableHandlers;
    this.extensions = [
      StarterKit.configure({
        history: false,
        heading: false,
        paragraph: false,
        listItem: false,
        italic: false,
        bold: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        strike: false
      }),
      Position,
      Paragraph,
      Italic.extend({
        addInputRules() {
          return [];
        },
        addPasteRules() {
          return [];
        }
      }),
      Bold.extend({
        addInputRules() {
          return [];
        },
        addPasteRules() {
          return [];
        }
      }),
      Typography.configure({
        oneHalf: false,
        oneQuarter: false,
        threeQuarters: false,
        laquo: false,
        raquo: false,
        plusMinus: false
      }),
      ListItem.configure({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.splitListItem(this.name),
            Tab: () => this.editor.commands.sinkListItem(this.name),
            "Shift-Tab": () => this.editor.commands.liftListItem(this.name)
          };
        }
      }),
      History.configure({ depth: 10 }),
      // FontFamily.configure({
      //   types: ["textStyle"]
      // }),
      //FontFamily,
      Text,
      // Draggable,
      CustomLink.configure({
        removeLink: linkHandlers.removeLink,
        protocols: ["www"],
        validate: href => {
          return href.replace(URL_INCLUDE_REGEX, matchedText => {
            let result = false;
            if (!URL_EXCLUDE_REGEX.test(matchedText)) {
              result = true;
            }
            return result;
          });
        }
      }),
      // TextStyle,
      Color,
      Indent,
      Highlight,
      ExternalVideo,
      CustomUnderLine,
      CustomTableCell,
      TableRow,
      TableHeader,
      Gapcursor,
      Heading,
      CustomTable,
      EventHandler,
      TrailingNode,
      FocusNode,
      File.configure({
        addFile: fileHandlers.addFile,
        removeFile: fileHandlers.removeFile,
        notify: fileHandlers.notify,
        setIsLoading: fileHandlers.setIsLoading
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
      //editable: this.editable,
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
          // const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          //  console.log(formatHTML)
          // console.log(_formatHTML)
          return formatHTML;
        },
        transformPastedHTML(html) {
          const formatHTML = html
            .replace(/&nbsp;/g, "")
            .replace(/ comment(.*?)">/g, ">");

          //Remove comments
          const formatHTML1 = formatHTML.replace(/<\/?style(.*?)">/g, "");
          const formatHTML2 = formatHTML1.replace(/<br>/g, " ");
          const formatHTML3 = formatHTML2.replace(/<br>/g, " ");
          // const formatHTML3 = formatHTML2.replace(/<\/?p[^>]*>/g, "");
          // const formatHTMLX = formatHTML3.replace(
          //   /(<p[^>]*>)[^>]*(<img)/g,
          //   "img"
          // );
          const formatHTML4 = formatHTML3.replace("<!--StartFragment-->", "");
          const formatHTML5 = formatHTML4.replace("<!--EndFragment-->", "");

          //const transformHtml = parseDocxHTml(formatHTML5)

          // // console.log(formatHTML1);
          // const parser = new DOMParser();
          // const temp_node = parser.parseFromString(formatHTML2, "text/html")
          //   .body;
          //   const imgs = temp_node.getElementsByTagName('img')
          //   const paragraphs = temp_node.getElementsByTagName('p')
          // console.log({imgs});
          // console.log({paragraphs});
          // console.log(temp_node.childNodes);

          // TODO: Test if images can be stripped out from <p><span></span></span_></p>

          //  const ____formatHTML = ___formatHTML.replace(/\<head[^>]*\>([^]*)\<\/head/g, '');
          //  const _____formatHTML = ____formatHTML.replace(/\<script[^>]*\>([^]*)\<\/script>/g, '');

          // const ast = parse(____formatHTML);
          // let res = ""

          // walk(ast, {
          //   enter: (node) => {
          //     console.log(node)
          //     if (node.type === SyntaxKind.Tag && node.name === 'title' && Array.isArray(node.body)) {
          //       const text = node.body[0];
          //       if (text.type !== SyntaxKind.Text) {
          //         return;
          //       }
          //       const div = document.createElement('div');
          //       div.innerHTML = `The title of the input is <strong>${text.value}</strong>`;
          //       res = div;
          //     }
          //   },
          // });
          // console.log(res

          //  console.log(formatHTML5);
          // console.log(
          //   unwrapImages(
          //     formatHTML5.replace("img", "file-component").replace("span", "p")
          //   )
          // );
          // return unwrapImages(formatHTML5);
          return formatHTML5
            .replace("img", "file-component")
            .replace("span", "p");
          // return formatHTML5.replace('img', 'file-component')

          //     return formatHTML4;
        }
      },

      onUpdate: ({ editor }) => {
        setTimeout(() => {
          if (editor.isActive("listItem")) {
            const node = editor.state.selection.$head.node();
            if (node.attrs.indent) {
              editor.commands.updateAttributes(node.type.name, { indent: 0 });
            }
          }

          const json = editor.getJSON();
          this.options.onUpdate(json);
        });
      }
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
