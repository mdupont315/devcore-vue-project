import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Gapcursor from "@tiptap/extension-gapcursor";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
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
        codeBlock: false
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
      FontFamily.configure({
        types: ["textStyle"]
      }),
      Text,
      // Draggable,
      CustomLink.configure({
        removeLink: linkHandlers.removeLink,
        protocols: ["www", "mailto"]
      }),
      TextStyle,
      Color,
      Indent,
      Highlight,
      ExternalVideo,
      CustomUnderLine,
      TableRow,
      TableHeader,
      TableCell,
      Gapcursor,
      Heading,
      CustomTable,
      EventHandler,
      TrailingNode,
      FocusNode,
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
         // const formatHTML3 = formatHTML2.replace(/<\/?p[^>]*>/g, "");
          // const formatHTMLX = formatHTML3.replace(
          //   /(<p[^>]*>)[^>]*(<img)/g,
          //   "img"
          // );
        const formatHTML4 = formatHTML2.replace(/<\/?span[^>]*>/g, "");

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
          // console.log(res)

          return formatHTML4;
        }
      },

      onUpdate: ({ editor }) => {
        setTimeout(() => {
          editor.state.doc.descendants((node, pos, parent) => {
            if (
              ["orderedList", "bulletList", "listItem"].includes(node.type.name)
            ) {
              return true;
            }

            if (
              node.type.name === "paragraph" &&
              parent.type.name === "listItem" &&
              node.attrs.indent > 0
            ) {
              editor.view.dispatch(
                editor.state.tr.setNodeMarkup(pos, null, { indent: 0 })
              );
            }

            return false;
          });

          // if (!this.dedupedCommentNodes) {
          //   this.dedupedCommentNodes = true;
          // }

          // this.dedupedCommentNodes = false;

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