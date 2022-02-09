// import { createCell } from './createCell.js'
import { Schema, NodeType } from 'prosemirror-model'

export function createTable(schema, rowsCount, colsCount, withHeaderRow, cellContent) {
  const types = getTableNodeTypes(schema)
  console.log(schema)
  console.log(types)
  const headerCells = []
  const cells = []

 function createCell(cellType, cellContent) {
    if (cellContent) {
      return cellType.createChecked(null, cellContent)
    }

    return cellType.createAndFill()
  }


function getTableNodeTypes(schema) {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes
  }

  const roles = {}

  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type]

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType
    }
  })

  schema.cached.tableNodeTypes = roles
  console.log(schema.cached)

  return roles
}




  for (let index = 0; index < colsCount; index += 1) {
    const cell = createCell(types.cell, cellContent)

    if (cell) {
      cells.push(cell)
    }

    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, cellContent)

      if (headerCell) {
        headerCells.push(headerCell)
      }
    }
  }

  const rows = []

  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells))
  }

  return types.table.createChecked(null, rows)
}
