<template>
  <div class="search-bar">
    <b-input-group style="margin-top:5px" class="search">
      <b-form-input
        v-model="currentFilter"
        class="search"
        :placeholder="$t('Search projects') + ` (${items.length})`"
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
      filter: "project/filter",
      currentProcess: "process/current"
    }),
    process: {
      get() {
        return this.currentProcess("projects").process || null;
      }
    },
    items: {
      get() {
        if (!this.process) {
          return [];
        }
        return this.$store.getters["project/filteredByprocess"](this.process.id);
      }
    }
  },
  async mounted() {
    this.currentFilter = this.filter;
  },
  methods: {
    async filterResults(filter) {
      await this.$store.dispatch("project/filter", filter);
    }
  }
};
</script>