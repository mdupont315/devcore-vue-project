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
import { mapGetters } from "vuex";
// import { PERM_COMPANY_MANAGE } from '@/config/app';
import MenuItem from "./MenuItem";

export default {
  name: "NavMenu",
  components: {
    item: MenuItem
  },
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/user",
    })
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
        } else if (this.checkPermission(item) && this.checkPanelValidate(item)) {
            ret.push(item);
          }
      });
      return ret;
    },
    checkPermission(item) {
      if (item.permissions) {
        return this.$can(item.permissions);
      }
      return true;
    },
    checkPanelValidate(item) {
        if ( this.user.can("core/company/manage") &&
            item.permissions !== "core/company/manage" ) {
          return false;
        } 
          return true;
        
    }
  }
};
</script>