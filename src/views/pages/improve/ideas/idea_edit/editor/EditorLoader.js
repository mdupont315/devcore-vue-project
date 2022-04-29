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
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      editorProps: {
        transformPastedText(text) {
          //Remove spaces
          const formatHTML = text.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");
          return _formatHTML;
        },
        transformPastedHTML(html) {
          //Remove spaces
          const formatHTML = html.replace(/&nbsp;/g, " ");

          //Remove comments
          const _formatHTML = formatHTML.replace(/ comment(.*?)">/g, ">");

          return _formatHTML;
        }
      },
      onUpdate: ({ editor }) => {
        setTimeout(() => {
          const json = editor.getJSON();

          this.options.onUpdate(json);
        });
      },
      onFocus: ({ editor }) => {
        const json = editor.getJSON();
        this.options.onUpdate(json);
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
