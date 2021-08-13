<template>
  <div class="page animated fadeIn engage_container">
    <div
      v-if="currentItem || currentRowDetails"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>

    <page-loader v-if="isLoading"></page-loader>

    <div class="engage_container_content" v-else>
      <engage-progress :items="getMilestones"></engage-progress>
      <engage-table :items="milestones"></engage-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import engageProgress from "./Progress.vue";
import engageTable from "./Table.vue";

export default {
  data: () => {
    return {
      isLoading: null,
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
    this.isLoading = true;
    await this.$store.dispatch("milestone/findAll", {
      force: true,
    });
    this.isLoading = false;
  },
  computed: {
    ...mapGetters({
      milestones: "milestone/filteredItems",
    }),
    getMilestones() {
      const sorted = [...this.milestones].sort((a, b) =>
        a.requiredScore > b.requiredScore ? 1 : -1
      );
      return sorted;
    },
  },
};
</script>

<style scoped>
.engage_container {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  max-height: calc(100vh - 60px);
}
.engage_container_content {
  display: flex;
  height: 100%;
  justify-content: space-between;
  flex-direction: column;
}


</style>
