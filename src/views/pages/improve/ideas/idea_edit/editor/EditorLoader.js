import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Gapcursor from "@tiptap/extension-gapcursor";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import History from "@tiptap/extension-history";
import FontFamily from "@tiptap/extension-font-family";
import Link from '@tiptap/extension-link'
import { Color } from "@tiptap/extension-color";
import { Indent, EventHandler, CustomStyle, CustomTable, File, Draggable } from './extensions'

export default class ContentEditor {
  constructor(editable, value, options, upload) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.upload = upload;
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
        HTMLAttributes: { target: '_blank' },
        linkOnPaste: false,
        openOnClick: true,
      }),
      TextStyle,
      CustomStyle,
      Color,
      Indent,
      Highlight,
      Underline,
      TableRow,
      TableHeader,
      TableCell,
      Gapcursor,
      File(upload),
      CustomTable,
      EventHandler,
      CharacterCount.configure({
        limit: 10000
      })
    ];
    this.editor = this.getEditorInstance();
    this.editor.commands.setParagraphText();
    this.editor.commands.setFontFamily("FuturaLight");
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        this.options.onUpdate(json);
      },
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
