<template>
  <div class="page animated fadeIn engage_container">
    <div
      v-if="currentItem || currentRowDetails"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>

    <page-loader v-if="filter.busy"></page-loader>
    <engage-progress :items="milestones" v-if="!filter.busy"></engage-progress>
    <engage-table :items="milestones" v-if="!filter.busy"></engage-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import engageProgress from "./Progress.vue";
import engageTable from "./Table.vue";

export default {
  data: () => {
    return {
      filter: {
        busy: false,
      },
      currentItem: null,
      currentRowDetails: null,
    };
  },
  components: {
    "engage-progress": engageProgress,
    "engage-table": engageTable,
  },
  async mounted() {
    this.filter.busy = true;
    await this.$store.dispatch("milestone/findAll", {
      force: true,
    });
    this.filter.busy = false;
  },
  computed: {
    ...mapGetters({
      milestones: "milestone/filteredItems",
    }),
  },
};
</script>

<style>
.engage_container {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  justify-content: space-evenly;
}
</style>
