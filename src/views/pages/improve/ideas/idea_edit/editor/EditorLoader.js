import { Editor } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
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
import { Color } from "@tiptap/extension-color";

import { Indent, EventHandler, CustomStyle, CustomTable } from './extensions'

export default class ContentEditor {
  constructor(editable, value, options) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.extensions = [
      StarterKit.configure({
        history: false
      }),
      History.configure({ depth: 10 }),
      FontFamily.configure({
        types: ["textStyle"]
      }),
      Text,
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
      CustomTable,
      EventHandler,
      // Collaboration.configure({
      //   document: ydoc,
      // }),
      // CollaborationCursor.configure({
      //   provider: this.provider,
      //   user: {
      //     name: null,
      //     color: "#958DF1",
      //   },
      // }),
      CharacterCount.configure({
        limit: 10000
      })
    ];
    this.editor = this.getEditorInstance();
  }

  getEditorInstance() {
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      onUpdate: ({ editor }) => {
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
