import TableCell from "@tiptap/extension-table-cell";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import TableCellComponent from "./TableCell.vue";

export default TableCell.extend({
  addNodeView() {
    return VueNodeViewRenderer(TableCellComponent, {
      stopEvent: () => false
    });
  }
});
