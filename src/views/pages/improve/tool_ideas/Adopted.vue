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
          :id="`tool-idea-id-${item.uuid}`"
          :ref="`tool-idea-ref-${item.uuid}`"
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
import IdeaCard from "../ideas/Card";
/* eslint-disable */

export default {
  components: {
    "idea-card": IdeaCard,
  },
  async mounted() {
    if (this.$router.currentRoute.query) {
      if (
        this.$router.currentRoute.query.uuid &&
        this.$router.currentRoute.query.toolId
      ) {

        const { uuid } = this.$router.currentRoute.query;
        this.$nextTick(() => {
          const ideaSelector = `tool-idea-id-${uuid}`;
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
      tools: "companyTool/all",
      currentTool: "companyTool/current",
    }),
    process: {
      get() {
        return this.currentProcess("toolIdeas");
      },
    },
    tool: {
      get() {
        return this.currentTool("toolIdeas");
      },
      set(toolId) {
        this.$store.dispatch("companyTool/setCurrent", {
          section: "toolIdeas",
          tool: { id: toolId },
        });
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
            `toolIdea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) =>
              this.filterByProcessSection(i, "ADOPTED") &&
              (this.tool ? i.tool.id === this.tool.toolId : true)
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
          break;
        case "stage":
          return item.status === status && item.parentType === "process_stage";
          break;
        case "operation":
          return (
            item.status === status && item.parentType === "process_operation"
          );
          break;

        case "phase":
          return item.status === status && item.parentType === "process_phase";
          break;
        default:
          return false;
      }
    },
  },
};
</script>
