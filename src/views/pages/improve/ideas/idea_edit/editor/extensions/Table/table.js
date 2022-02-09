import {
  Node,
  mergeAttributes,
  getExtensionField,
  callOrReturn,
  Extension
} from '@tiptap/core'
import {
  tableEditing,
  goToNextCell,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  deleteTable,
} from 'prosemirror-tables'
import { TextSelection } from 'prosemirror-state'
import { createTable } from './utilities/createTable'
import { TableView } from './tableView'


export const Table = Node.create({
  name: 'table',

  addOptions() {
    return {
      HTMLAttributes: {},
      resizable: false,
      handleWidth: 5,
      cellMinWidth: 500,
      View: TableView,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    }
  },

  content: 'tableRow+',

  tableRole: 'table',

  isolating: true,

  group: 'block',

  parseHTML() {
    return [
      { tag: 'table' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['tbody', 0]]
  },

  addCommands() {
    return {
      insertTable: ({ rows = 3, cols = 3, withHeaderRow = true } = {}) => ({ tr, dispatch, editor }) => {
        console.log(editor.schema)
        const node = createTable(editor.schema, rows, cols, withHeaderRow)

        if (dispatch) {
          const offset = tr.selection.anchor + 1

          tr.replaceSelectionWith(node)
            .scrollIntoView()
            .setSelection(TextSelection.near(tr.doc.resolve(offset)))
        }

        return true
      },

      addColumnAfter: () => ({ state, dispatch }) => {
        return addColumnAfter(state, dispatch)
      },
      deleteColumn: () => ({ state, dispatch }) => {
        return deleteColumn(state, dispatch)
      },
      addRowBefore: () => ({ state, dispatch }) => {
        return addRowBefore(state, dispatch)
      },
      addRowAfter: () => ({ state, dispatch }) => {
        return addRowAfter(state, dispatch)
      },
      deleteRow: () => ({ state, dispatch }) => {
        return deleteRow(state, dispatch)
      },
      deleteTable: () => ({ state, dispatch }) => {
        return deleteTable(state, dispatch)
      },
      goToNextCell: () => ({ state, dispatch }) => {
        return goToNextCell(1)(state, dispatch)
      },
      goToPreviousCell: () => ({ state, dispatch }) => {
        return goToNextCell(-1)(state, dispatch)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.commands.goToNextCell()) {
          return true
        }

        if (!this.editor.can().addRowAfter()) {
          return false
        }

        return this.editor
          .chain()
          .addRowAfter()
          .goToNextCell()
          .run()
      },
      'Shift-Tab': () => this.editor.commands.goToPreviousCell(),
    }
  },

  addProseMirrorPlugins() {

    return [
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]
  },

  extendNodeSchema(extension) {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
    }

    return {
      tableRole: callOrReturn(getExtensionField(extension, 'tableRole', context)),
    }
  },
})
