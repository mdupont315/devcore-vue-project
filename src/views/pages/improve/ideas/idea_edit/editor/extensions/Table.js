import Table from "@tiptap/extension-table";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import TableComponent from "./Table.vue";

export default Table.extend({
  addNodeView() {
    return VueNodeViewRenderer(TableComponent, {
      stopEvent: () => false
    });
  }
});
