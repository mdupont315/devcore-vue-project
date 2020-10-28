<template>
  <div class="search-bar">
    <b-input-group style="margin-top:5px" class="search">
      <b-form-input
        class="search"
        v-model="currentFilter"
        @input="filterResults"
        :placeholder="$t('Search tools') + ` (${items.length})`"
      ></b-form-input>
    </b-input-group>
  </div>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  data: () => {
    return {
      currentFilter: null
    };
  },
  computed: {
    ...mapGetters({
      items: "companyTool/filteredItems",
      filter: "companyTool/filter"
    })
  },
  async mounted() {
    this.currentFilter = this.filter;
  },
  methods: {
    async filterResults(filter) {
      await this.$store.dispatch("companyTool/filter", filter);
    }
  }
};
</script>