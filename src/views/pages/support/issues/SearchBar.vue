<template>
  <div class="search-bar">
    <b-input-group style="margin-top:5px" class="search">
      <b-form-input
        v-model="currentFilter"
        class="search"
        :placeholder="$t('Search issues') + ` (${items.length})`"
        @input="filterResults"
      ></b-form-input>
    </b-input-group>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  data: () => {
    return {
      currentFilter: null
    };
  },
  computed: {
    ...mapGetters({
      items: "issue/filteredItems",
      filter: "issue/filter"
    })
  },
  async mounted() {
    this.currentFilter = this.filter;
  },
  methods: {
    async filterResults(filter) {
      await this.$store.dispatch("issue/filter", filter);
    }
  }
};
</script>