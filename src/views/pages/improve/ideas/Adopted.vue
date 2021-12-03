<template>
  <div>
    <b-row v-if="currentProcessSection">
      <b-col class="col-6 mx-auto">
        <h3 class="h4 text-white text-uppercase" style="padding-top: 15px">
          {{ $t("Adopted ideas") }}
          <span class="text-gray-lighter">{{ adoptedIdeas.length }}</span>
        </h3>
        <idea-card
          v-for="item in adoptedIdeas"
          :id="`idea-id-${item.uuid}`"
          :ref="`idea-ref-${item.uuid}`"
          :key="item.id"
          :idea="item"
        ></idea-card>
        <div v-if="adoptedIdeas.length == 0">
          <p class="alert alert-warning">
            {{ $t("There are no records for the given criteria") }}
          </p>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import IdeaCard from "./Card";

export default {
  components: {
    "idea-card": IdeaCard,
  },
  mounted() {
    if (this.$router.currentRoute.query) {
      if (this.$router.currentRoute.query.uuid) {
        const { uuid } = this.$router.currentRoute.query;
        this.$nextTick(() => {
          const ideaSelector = `idea-id-${uuid}`;
          const element = document.getElementById(ideaSelector);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
    }),
    process: {
      get() {
        return this.currentProcess("ideas");
      },
    },
    currentProcessSection: {
      get() {
        return (
          this.process.phase ||
          this.process.operation ||
          this.process.stage ||
          this.process.process
        );
      },
    },
    currentProcessSectionName: {
      get() {
        if (this.process.phase) {
          return "phase";
        }
        if (this.process.operation) {
          return "operation";
        }
        if (this.process.stage) {
          return "stage";
        }
        if (this.process.process) {
          return "process";
        }
        return null;
      },
    },
    adoptedIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter((i) =>
            this.filterByProcessSection(i, "ADOPTED")
          );
        }
        return [];
      },
    },
  },
  methods: {
    filterByProcessSection(item, status) {
      switch (this.currentProcessSectionName) {
        case "process":
          return item.status === status;
        case "stage":
          return item.status === status && item.parentType === "process_stage";
        case "operation":
          return (
            item.status === status && item.parentType === "process_operation"
          );

        case "phase":
          return item.status === status && item.parentType === "process_phase";
        default:
          return false;
      }
    },
  },
};
</script>
