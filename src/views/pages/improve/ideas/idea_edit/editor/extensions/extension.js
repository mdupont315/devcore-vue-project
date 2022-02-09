import Table from "@tiptap/extension-table";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import TableCustom from "./TableCustom.vue";

export default Table.extend({
  addNodeView() {
    return VueNodeViewRenderer(TableCustom, {
      stopEvent: () => false
    });
  }
});
