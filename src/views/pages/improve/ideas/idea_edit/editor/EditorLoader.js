import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Indent } from "./extensions/indent.js";
import { EventHandler } from "./extensions/eventHandler.js";
import { CustomStyle } from "./extensions/CustomStyle.js";
import { mergeAttributes, getExtensionField, callOrReturn } from "@tiptap/core";
import { tableEditing, columnResizing } from "prosemirror-tables";

export function updateColumns(
  node,
  colgroup,
  table,
  cellMinWidth,
  overrideCol,
  overrideValue
) {
  let totalWidth = 0;
  let fixedWidth = true;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs;

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth =
        overrideCol === col ? overrideValue : colwidth && colwidth[j];
      const cssWidth = hasWidth ? `${hasWidth}px` : "";
      totalWidth += hasWidth || cellMinWidth;

      if (!hasWidth) {
        fixedWidth = false;
      }

      if (!nextDOM) {
        colgroup.appendChild(
          document.createElement("col")
        ).style.width = cssWidth;
      } else {
        if (nextDOM.style.width !== cssWidth) {
          nextDOM.style.width = cssWidth;
        }

        nextDOM = nextDOM.nextSibling;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode.removeChild(nextDOM);
    nextDOM = after;
  }

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`;
    table.style.minWidth = "";
  } else {
    table.style.width = "";
    table.style.minWidth = `${totalWidth}px`;
  }
}

export default class ContentEditor {
  constructor(editable, value, options) {
    this.editable = editable;
    this.content = value;
    this.options = options;
    this.extensions = [
      StarterKit.configure({
        history: false
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
      Table.extend({
        name: "table",
        // @ts-ignore
        addOptions() {
          return {
            HTMLAttributes: {},
            resizable: true,
            handleWidth: 5,
            cellMinWidth: 25,
            lastColumnResizable: false,
            allowTableNodeSelection: false
          };
        },

        content: "tableRow+",

        tableRole: "table",

        isolating: true,

        group: "block",

        selectable: true,

        resizable: true,

        parseHTML() {
          return [{ tag: "table" }];
        },

        renderHTML({ HTMLAttributes }) {
          return [
            "table",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            ["tbody", 0]
          ];
        },

        addNodeView() {
          return ({ editor, node: nodeViewNode, getPos }) => {
            let tempNoders = nodeViewNode;
            const cellMinWidth = 40;
            const dom = document.createElement("div");
            dom.className = "tableWrapper";

            if (editor.isEditable) {
              const tableDiv = document.createElement("div");
              tableDiv.className = "tableDivActions";

              //Remove Table
              const tableRemove = document.createElement("button");
              tableRemove.innerText = "Remove";
              tableRemove.className = "tableRemove-handle";

              //Row
              const tableAddRow = document.createElement("button");
              const tableRemoveRow = document.createElement("button");

              //Col
              const tableAddCol = document.createElement("button");
              const tableRemoveCol = document.createElement("button");

              tableAddRow.innerText = "Add Row";
              tableRemoveRow.innerText = "Remove Row";
              tableAddCol.innerText = "Add Col";
              tableRemoveCol.innerText = "Remove Col";

              tableRemove.addEventListener("click", event => {
                this.editor
                  .chain()
                  .focus()
                  .deleteTable()
                  .run();
              });
              tableAddRow.addEventListener("click", event => {
                this.editor
                  .chain()
                  .focus()
                  .addRowAfter()
                  .run();
              });
              tableRemoveRow.addEventListener("click", event => {
                this.editor
                  .chain()
                  .focus()
                  .deleteRow()
                  .run();
              });
              tableAddCol.addEventListener("click", event => {
                this.editor
                  .chain()
                  .focus()
                  .addColumnAfter()
                  .run();
              });
              tableRemoveCol.addEventListener("click", event => {
                this.editor
                  .chain()
                  .focus()
                  .deleteColumn()
                  .run();
              });

              tableDiv.appendChild(tableRemove);
              tableDiv.appendChild(tableRemoveRow);
              tableDiv.appendChild(tableAddRow);
              tableDiv.appendChild(tableAddCol);
              tableDiv.appendChild(tableRemoveCol);
              dom.appendChild(tableDiv);
            }

            const table = dom.appendChild(document.createElement("table"));
            const colgroup = table.appendChild(
              document.createElement("colgroup")
            );
            updateColumns(nodeViewNode, colgroup, table, cellMinWidth);
            const contentDOM = table.appendChild(
              document.createElement("tbody")
            );

            return {
              dom,
              contentDOM,
              ignoreMutation: mutation =>
                mutation.type === "attributes" &&
                (mutation.target === table ||
                  colgroup.contains(mutation.target)),
              update: node => {
                if (node.type !== nodeViewNode.type) {
                  console.log("false!");
                  return false;
                }

                tempNoders = node;
                updateColumns(tempNoders, colgroup, table, cellMinWidth);

                return true;
              }
            };
          };
        },

        addProseMirrorPlugins() {
          const isResizable = this.options.resizable && this.editor.isEditable;

          return [
            ...(isResizable
              ? [
                  columnResizing({
                    handleWidth: this.options.handleWidth,
                    cellMinWidth: this.options.cellMinWidth,
                    lastColumnResizable: this.options.lastColumnResizable
                  })
                ]
              : []),
            tableEditing({
              allowTableNodeSelection: this.options.allowTableNodeSelection
            })
          ];
        },

        extendNodeSchema(extension) {
          const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage
          };

          return {
            tableRole: callOrReturn(
              getExtensionField(extension, "tableRole", context)
            )
          };
        }
      }),
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

  getEditorInstance(){
    return new Editor({
      editable: this.editable,
      content: this.content,
      extensions: this.extensions,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        this.options.onUpdate(json)
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

