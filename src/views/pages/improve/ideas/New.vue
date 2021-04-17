<template>
  <div style="padding-bottom: 400px" id="newIdeas__container">
    <b-row v-if="currentProcessSection">
      <b-col cols="6" class="mx-auto">
        <div class="h4 text-white text-uppercase clearfix">
          <h3 class="h4 float-left" style="padding-top: 9px">
            {{ $t("New ideas") }}
            <span class="h4 text-gray-lighter">{{ newIdeas.length }}</span>
          </h3>
          &nbsp;
        </div>
        <idea-card
          v-for="item in newIdeas"
          :key="item.id"
          :idea="item"
        ></idea-card>
        <div v-if="newIdeas.length == 0">
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
/* eslint-disable */

export default {
  components: {
    "idea-card": IdeaCard,
  },
  mounted() {
    if (this.$router.currentRoute.params) {
      if (this.$router.currentRoute.params?.type) {
        this.$nextTick(() => {
          let element = document.getElementById("newIdeas__container");
          element.scrollIntoView({ behavior: "smooth", block: "end" });
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
    newIdeas: {
      get() {
        if (this.currentProcessSectionName) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter((i) => {
            return this.filterByProcessSection(i, "NEW");
          });
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
