import Table from "@tiptap/extension-table";
import { mergeAttributes, getExtensionField, callOrReturn } from "@tiptap/core";
import { tableEditing, columnResizing } from "prosemirror-tables";

const getElementWithAttributes = (name, attrs) => {
  const el = document.createElement(name);

  if (!el) throw new Error(`Element with name ${name} can't be created.`);

  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }

  return el;
};

const rowControlButtonsData = [
  {
    name: "Remove Row",
    action: editor =>
      editor
        .chain()
        .focus()
        .deleteRow()
        .run(),
    text: "-"
  },
  {
    name: "Add Row",
    action: editor =>
      editor
        .chain()
        .focus()
        .addRowAfter()
        .run(),
    text: "+"
  }
];

const getRowControlButtons = editor => {
  const container = getElementWithAttributes("div", {
    class: "row-control-button-container"
  });

  for (const el of rowControlButtonsData) {
    const btn = getElementWithAttributes("button", {
      class: "table-control-button "
    });
    btn.innerText = el.text;

    btn.addEventListener("click", () => el.action(editor));

    btn.setAttribute("data-tooltip", el.name);

    container.appendChild(btn);
  }

  return container;
};

const deleteTableButtonData = {
  name: "Delete Table",
  action: editor =>
    editor
      .chain()
      .focus()
      .deleteTable()
      .run(),
  text: "Remove"
};

const getDeleteTableButton = editor => {
  const { name, action, text } = deleteTableButtonData;

  const el = getElementWithAttributes("button", {
    class: "delete-table-button"
  });

  el.addEventListener("click", () => action(editor));
  el.innerText = text;

  el.setAttribute("data-tooltip", name);

  return el;
};

const colControlButtonsData = [
  {
    name: "Remove Col",
    action: editor =>
      editor
        .chain()
        .focus()
        .deleteColumn()
        .run(),
    text: "-"
  },
  {
    name: "Add Col",
    action: editor =>
      editor
        .chain()
        .focus()
        .addColumnAfter()
        .run(),
    text: "+"
  }
];

const getColControlButtons = editor => {
  const container = getElementWithAttributes("div", {
    class: "col-control-button-container"
  });

  for (const el of colControlButtonsData) {
    const btn = getElementWithAttributes("button", {
      class: "table-control-button "
    });
    btn.innerText = el.text;

    btn.addEventListener("click", () => el.action(editor));

    btn.setAttribute("data-tooltip", el.name);

    container.appendChild(btn);
  }

  return container;
};

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
    console.log("totalWidth", totalWidth);
    table.style.width = "";
    table.style.minWidth = `${totalWidth}px`;
  }
}

export const CustomTable = Table.extend({
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
      ["tbody", { class: "test" }, 0]
    ];
  },

  addNodeView() {
    return ({ editor, node: nodeViewNode, getPos }) => {
      let tempNoders = nodeViewNode;

      const cellMinWidth = 40;

      const dom = getElementWithAttributes("div", { class: "tableWrapper" });

      const table = document.createElement("table");

      if (editor.isEditable) {
        const tableFirstRow = getElementWithAttributes("div", {
          class: "table-first-row"
        });

        const tableSecondRow = getElementWithAttributes("div", {
          class: "table-second-row"
        });

        tableSecondRow.appendChild(getDeleteTableButton(editor));
        tableSecondRow.appendChild(getColControlButtons(editor));
        tableSecondRow.appendChild(getElementWithAttributes("div", {}));

        const tableLeftContainer = getElementWithAttributes("section", {
          class: "tableLeftSection"
        });

        const tableRightContainer = getElementWithAttributes("section", {
          class: "tableRightSection"
        });

        tableRightContainer.appendChild(getRowControlButtons(editor));

        tableFirstRow.appendChild(tableLeftContainer);
        tableFirstRow.appendChild(tableRightContainer);

        dom.appendChild(tableFirstRow);
        dom.appendChild(tableSecondRow);

        tableLeftContainer.appendChild(table);
      } else {
        dom.appendChild(table);
      }

      const colgroup = table.appendChild(document.createElement("colgroup"));

      updateColumns(nodeViewNode, colgroup, table, cellMinWidth);

      const contentDOM = table.appendChild(document.createElement("tbody"));

      return {
        dom,
        contentDOM,
        ignoreMutation: mutation =>
          mutation.type === "attributes" &&
          (mutation.target === table || colgroup.contains(mutation.target)),
        update: node => {
          if (node.type !== nodeViewNode.type) {
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

    const plugins = [
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection
      })
    ];

    if (isResizable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable
        })
      );
    }

    return plugins;
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
});

export default CustomTable;
