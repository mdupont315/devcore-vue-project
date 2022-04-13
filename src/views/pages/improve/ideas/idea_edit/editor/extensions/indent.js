import { Extension } from "@tiptap/core";
import { TextSelection, AllSelection } from "prosemirror-state";

export const clamp = (val, min, max) => {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};

const IndentProps = {
  min: 0,
  max: 90,

  more: 10,
  less: -10
};

export function isBulletListNode(node) {
  return node.type.name === "bullet_list";
}

export function isOrderedListNode(node) {
  return node.type.name === "order_list";
}

export function isTodoListNode(node) {
  return node.type.name === "todo_list";
}

export function isListNode(node) {
  return (
    isBulletListNode(node) || isOrderedListNode(node) || isTodoListNode(node)
  );
}

function setNodeIndentMarkup(tr, pos, delta) {
  if (!tr.doc) return tr;

  const node = tr.doc.nodeAt(pos);
  if (!node) return tr;

  const minIndent = IndentProps.min;
  const maxIndent = IndentProps.max;

  const indent = clamp((node.attrs.indent || 0) + delta, minIndent, maxIndent);

  if (indent === node.attrs.indent) return tr;

  const nodeAttrs = {
    ...node.attrs,
    indent
  };

  return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
}

const updateIndentLevel = (tr, delta) => {
  const { doc, selection } = tr;

  if (!doc || !selection) return tr;

  if (
    !(selection instanceof TextSelection || selection instanceof AllSelection)
  ) {
    return tr;
  }

  const { from, to } = selection;

  doc.nodesBetween(from, to, (node, pos) => {
    const nodeType = node.type;

    if (nodeType.name === "paragraph" || nodeType.name === "heading") {
      tr = setNodeIndentMarkup(tr, pos, delta);
      return false;
    }
    if (isListNode(node)) {
      return false;
    }
    return true;
  });

  return tr;
};

export const Indent = Extension.create({
  name: "indent",

  addOptions() {
    return {
      types: ["heading", "paragraph", "heading"],
      indentLevels: ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90"],
      defaultIndentLevel: 0,
      minLevel: 0,
      maxLevel: 8
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            renderHTML: attributes => ({
              style: `margin-left: ${attributes.indent}%!important;`
            }),
            parseHTML: element =>
              parseInt(element.style.marginLeft) ||
              this.options.defaultIndentLevel
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, IndentProps.more);

        if (tr.docChanged) {
          // eslint-disable-next-line no-unused-expressions
          dispatch && dispatch(tr);
          return true;
        }

        editor
          .chain()
          .focus()
          .run();

        return false;
      },
      outdent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        tr = tr.setSelection(selection);
        tr = updateIndentLevel(tr, IndentProps.less);

        if (tr.docChanged) {
          // eslint-disable-next-line no-unused-expressions
          dispatch && dispatch(tr);
          return true;
        }

        editor
          .chain()
          .focus()
          .run();

        return false;
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (
          !(
            this.editor.isActive("bulletList") ||
            this.editor.isActive("orderedList")
          )
        ) {
          return this.editor.commands.indent();
        }
      },
      "Shift-Tab": () => {
        if (
          !(
            this.editor.isActive("bulletList") ||
            this.editor.isActive("orderedList")
          )
        ) {
          this.editor.chain().focus();
          return this.editor.commands.outdent();
        }
      }
      // Backspace: () => {
      //   if (
      //     !(
      //       this.editor.isActive("bulletList") ||
      //       this.editor.isActive("orderedList")
      //     )
      //   ) {
      //     return this.editor.commands.outdent();
      //   }
      // }
    };
  }
});
