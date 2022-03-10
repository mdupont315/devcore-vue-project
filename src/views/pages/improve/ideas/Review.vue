<template>
  <div style="padding-bottom: 100px" id="reviewIdeas__container">
    <div class="reviewIdeas-header">
      <div class="testing-reviewIdeas-header">
        <span class="h4 text-white text-uppercase"
          >{{ $t("In testing") }}
        </span>
        <span class="text-gray-lighter h4 text-white text-uppercase">{{
          testingIdeas.length
        }}</span>
      </div>
      <div class="evaluating-reviewIdeas-header">
        <span class="h4 text-white text-uppercase">
          {{ $t("Evaluated ideas") }}
        </span>
        <span class="text-gray-lighter h4 text-white text-uppercase">{{
          evaluatedIdeas.length
        }}</span>
      </div>
    </div>
    <div v-if="currentProcessSection" style="padding-bottom: 100px">
      <div
        v-for="index in Math.max(testingIdeas.length, evaluatedIdeas.length)"
        :key="index"
        class="reviewIdeas-content-container"
        :class="
          thisOrNextOpen(index - 1) ? 'ideasAreInColumn' : 'ideasAreInRow'
        "
      >
        <idea-card
          v-if="testingIdeas[index - 1]"
          class="review-idea-card review-idea-card-testing"
          :id="`idea-id-${testingIdeas[index - 1].uuid}`"
          :ref="`idea-ref-${testingIdeas[index - 1].uuid}`"
          @openIdea="ideaOpened"
          @closeIdea="ideaClosed"
          :idea="testingIdeas[index - 1]"
        ></idea-card>
        <div
          v-else-if="!ideaUuidOpened && !testingIdeas[index - 1]"
          style="width: 100%"
        >
          <p
            class="alert alert-warning"
            v-if="index === 1"
            style="margin-right: 20px"
          >
            {{ $t("There are no records for the given criteria") }}
          </p>
        </div>
        <idea-card
          v-if="evaluatedIdeas[index - 1]"
          class="review-idea-card review-idea-card-evaluating"
          :id="`idea-id-${evaluatedIdeas[index - 1].uuid}`"
          :ref="`idea-ref-${evaluatedIdeas[index - 1].uuid}`"
          @openIdea="ideaOpened"
          @closeIdea="ideaClosed"
          :idea="evaluatedIdeas[index - 1]"
        ></idea-card>
        <div
          v-else-if="!ideaUuidOpened && !evaluatedIdeas[index - 1]"
          style="width: 100%"
        >
          <p
            class="alert alert-warning"
            v-if="index === 1"
            style="margin-left: 20px"
          >
            {{ $t("There are no records for the given criteria") }}
          </p>
        </div>
      </div>
    </div>
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
        this.scrollToElement(uuid);
        this.ideaUuidOpened = uuid;
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
    testingIdeas: {
      get() {
        if (this.currentProcessSection) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) => this.filterByProcessSection(i, "TESTING") && !i.hasReviews
          );
        }
        return [];
      },
    },
    evaluatedIdeas: {
      get() {
        if (this.currentProcessSection) {
          return this.$store.getters[
            `idea/by${this.currentProcessSectionName.capitalize()}`
          ](this.currentProcessSection.id).filter(
            (i) => this.filterByProcessSection(i, "TESTING") && i.hasReviews
          );
        }
        return [];
      },
    },
  },
  data: () => ({
    ideaUuidOpened: null,
  }),
  methods: {
    scrollToElement(uuid) {
      if (!uuid) return;
      this.$nextTick(() => {
        const ideaSelector = `idea-id-${uuid}`;
        const element = document.getElementById(ideaSelector);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      });
    },
    thisOrNextOpen(index) {
      const testingIdeaIndex = this.testingIdeas[index]
        ? this.testingIdeas[index].uuid
        : false;

      const evaluatedIdeas = this.evaluatedIdeas[index]
        ? this.evaluatedIdeas[index].uuid
        : false;

      return (
        testingIdeaIndex === this.ideaUuidOpened ||
        evaluatedIdeas === this.ideaUuidOpened
      );
    },
    ideaClosed(idea) {
      console.log("CLOSED!");
      this.ideaUuidOpened = null;
    },
    ideaOpened(idea) {
      this.ideaUuidOpened = idea.uuid;
      this.scrollToElement(idea.uuid);
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

<style scoped lang="scss">
.reviewIdeas-content-container {
  display: flex;
  width: 100%;
}
.testing-reviewIdeas-header,
.evaluating-reviewIdeas-header {
  padding: 10px;
  width: 100%;
  max-width: 50%;
}
.evaluating-reviewIdeas-header-empty,
.testing-reviewIdeas-header-empty {
  width: 100%;
  padding-top: 8px;
}

.reviewIdeas-header {
  display: flex;
  justify-content: space-between;
  height: 40px;
}

.reviewIdeas-content-container.ideasAreInRow {
  justify-content: end;
}

.testingIdeas-content-container.ideasAreInRow {
  justify-content: start;
}

.ideasAreInRow {
  align-self: flex-start;
  flex-direction: row;
  justify-content: space-between;
  & > .review-idea-card {
    width: 100%;
    max-width: 49%;
    max-height: 250px;
  }
}

.review-idea-card-testing{
	margin-right: 10px;
}
.review-idea-card-evaluating{
	margin:0 10px;
}
.ideasAreInColumn {
  flex-direction: column;
  align-self: flex-start;
  > .idea-card-shrunk {
    max-width: 49%;
    width: 100%;
    &.review-idea-card-testing {
      align-self: start;
    }
    &.review-idea-card-evaluating {
      align-self: end;
    }
  }

  > .idea-card-expanded {
    align-self: center;
    max-width: 100%;
    width: 100%;
    padding: 0;
  }
}
</style>
