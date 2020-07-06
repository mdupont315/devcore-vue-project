<template>
  <div class="search-bar">
    <b-input-group style="margin-top:5px" class="search">
      <b-form-input
        class="search"
        v-model="currentFilter"
        @input="filterResults"
        :placeholder="$t('Search process') + ` (${items.length})`"
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
      items: "process/filteredItems",
      filter: "process/filter"
    })
  },
  async mounted() {
    this.currentFilter = this.filter;
  },
  methods: {
    async filterResults(filter) {
    window.vm.$emit("process_filterChange");
    await this.$store.dispatch("process/filter", filter);
    }
  }
};
</script>