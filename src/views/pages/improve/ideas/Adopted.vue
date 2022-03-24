<template>
  <div style="padding-bottom: 100px" id="adoptedIdeas__container">
    <b-row v-if="currentProcessSection" class="adoptedIdeas__container">
      <b-col cols="12">
        <div
          class="h4 text-white text-uppercase clearfix adoptedIdeas-idea-count"
        >
          <h3 class="h4 adoptedIdeas-idea-count-text">
            {{ $t("Adopted ideas") }}
            <span class="h4 text-gray-lighter">{{ adoptedIdeas.length }}</span>
          </h3>
          &nbsp;
        </div>
        <idea-card
          v-for="item in adoptedIdeas"
          :class="
            isEditingIdea(item)
              ? 'adopted-idea_card_expanded'
              : 'adopted-idea_card_shrunk'
          "
          :id="`idea-id-${item.uuid}`"
          :ref="`idea-ref-${item.uuid}`"
          :key="item.id"
          :idea="item"
        ></idea-card>
        <div v-if="adoptedIdeas.length === 0">
          <p class="alert alert-warning adoptedIdeas-empty">
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
  // mounted() {
  //   if (this.$router.currentRoute.query) {
  //     if (this.$router.currentRoute.query.uuid) {
  //       const { uuid } = this.$router.currentRoute.query;
  //       this.$nextTick(() => {
  //         const ideaSelector = `idea-id-${uuid}`;
  //         const element = document.getElementById(ideaSelector);
  //         if (element) {
  //           element.scrollIntoView({ behavior: "smooth", block: "center" });
  //         }
  //       });
  //     }
  //   }
  // },
  computed: {
    ...mapGetters({
      currentProcess: "process/current",
      ideaInEdit: "idea/ideaInEdit",
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
    isEditingIdea(idea) {
      let ret = false;
      if (idea && idea.id && this.ideaInEdit) {
        ret = this.ideaInEdit.id === idea.id;
      }
      return ret;
    },
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
<style lang="scss">
.adopted-idea_card_shrunk {
  width: 50%;
  margin: auto;
}

.adopted-idea_card_expanded {
  width: 100%;
}

.adoptedIdeas-idea-count {
  width: 50%;
  margin: auto;
  & > .adoptedIdeas-idea-count-text {
    padding-top: 9px;
  }
}

.adoptedIdeas__container {
  display: flex;
  flex-direction: column;
  align-content: center;
}

.adoptedIdeas-empty {
  margin: auto;
  max-width: 50%;
}
</style>
