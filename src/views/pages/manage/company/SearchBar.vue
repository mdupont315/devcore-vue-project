<template>
  <div class="search-bar">
    <b-input-group style="margin-top: 5px" class="search">
      <b-form-input
        v-model="currentFilter"
        class="search"
        :placeholder="$t('Search Companies') + ` (${items.length})`"
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
      currentFilter: null,
    };
  },
  computed: {
    ...mapGetters({
      items: "company/filteredItems",
      filter: "company/filter",
    }),
  },
  async mounted() {
    console.log(this.filter);
    this.currentFilter = this.filter;
  },
  methods: {
    async filterResults(filter) {
      console.log(filter);
      await this.$store.dispatch("company/filter", filter);
    },
  },
};
</script>
