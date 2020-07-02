<template>
  <ul class="nav main-menu">
    <item
      v-for="(item,index) in filteredElements"
      :key="index"
      :item="item"
      class="item"
      :class="{'item-header':item.header, 'link':!item.header}"
    ></item>
  </ul>
</template>
<script>
import MenuItem from "./MenuItem";
export default {
  name: "nav-menu",
  components: {
    item: MenuItem
  },
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    filteredElements: []
  }),
  mounted() {
    this.filteredElements = this.filterElements(this.items);
  },
  methods: {
    filterElements(items) {
      const ret = [];
      items.map(item => {
        if (item.header) {
          item.children = this.filterElements(item.children);
          if (item.children.length > 0) {
            ret.push(item);
          }
        } else {
          if (this.checkPermission(item)) {
            ret.push(item);
          }
        }
      });
      return ret;
    },
    checkPermission(item) {
      if (item.permissions) {
        return this.$can(item.permissions);
      }
      return true;
    }
  }
};
</script>