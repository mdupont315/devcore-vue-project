<template>
  <b-card
    :id="'idea-card-' + idea.id"
    no-body
    class="mb-3 idea-card"
    :class="showDetail ? 'idea-card-expanded' : 'idea-card-shrunk'"
  >
    <layer v-if="showPopOverFeedback" @closed="togglePopOverFeedback" />
    <div class="idea_card_container" v-if="!showDetail">
      <b-card-header class="bg-white border-0">
        <div style="line-height: 1em">
          <nav aria-label="breadcrumb" class="m-0 p-0 d-inline-block">
            <ol class="breadcrumb text-capitalize bg-white m-0 p-0">
              <li v-if="process" class="breadcrumb-item text-overflow">
                <i class="mdi mdi-flask-empty text-gray"></i> &nbsp;
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'process')"
                  >{{ process.title }}</a
                >
              </li>
              <li v-if="stage" class="breadcrumb-item text-overflow">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'stage')"
                  >{{ stage.title }}</a
                >
              </li>
              <li v-if="operation" class="breadcrumb-item text-overflow">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'operation')"
                  >{{ operation.title }}</a
                >
              </li>
              <li v-if="phase" class="breadcrumb-item text-overflow">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'phase')"
                  >{{ phase.title }}</a
                >
              </li>
              <li
                v-if="idea.tool && idea.tool.id"
                class="breadcrum-item text-overflow ml-1"
              >
                &nbsp;|&nbsp;
                <a
                  href
                  class="text-gray"
                  @click.stop="setCurrentTool($event, idea.tool.id)"
                >
                  <i class="mdi mdi-tools"></i>
                  {{ idea.tool.name }}
                </a>
              </li>
            </ol>
          </nav>
          <hr />
        </div>
        <h2 class="title h4 text-bold text-capitalize mb-2 mt-1">
          {{ idea.title }}
        </h2>
        <div class="tools">
          <b-button
            class="btn-circle shadow-sm"
            size="lg"
            variant="light"
            @click="toggleIdea"
            >+
          </b-button>
        </div>
      </b-card-header>
      <b-card-body>
        <p class="text-gray mb-0 text-justify description">
          {{ idea.description || $t("No description") }}
        </p>
      </b-card-body>
      <b-card-footer class="bg-white border-0">
        <hr />
        <author-time
          :user="idea.author"
          :anonymous="idea.anonymous"
          :time="idea.createdAt"
          class="d-inline-block"
        ></author-time>
        <div
          class="info float-right"
          style="display: flex; align-items: center"
        >
          <idea-feedback
            v-if="!idea.replied && idea.author"
            style="margin-left: 20px; max-height: 46px"
            :item="idea"
            :user="idea.author"
            refTarget="ideaFeedbackIcon"
            :textPlaceholder="$t('Idea feedback')"
            :itemDescription="idea.description"
            type="ideaFeedback"
            @toggle="togglePopOverFeedback"
            @save="saveIdeaReply"
            @close="closeIdeaForFeedback"
            :openState="showPopOverFeedback"
          >
            <!-- <small
              class="d-block text-gray"
              style="line-height: 1em; align-self: center"
              >{{ $t("Feedback") }}</small
            > -->
          </idea-feedback>

          <span v-if="idea.evaluationsCount > 0" class="font-15x ml-2">
            <b-badge variant="black">{{ idea.evaluationsCount }}</b-badge>
          </span>
          <span v-if="idea.evaluationsCount > 0" class="font-15x ml-2">
            <b-badge variant="black">{{
              $currency(calcEvaluationAvg())
            }}</b-badge>
          </span>

          <span v-if="idea.improvementsCount > 0" class="font-15x ml-2">
            <b-badge variant="primary">{{ idea.improvementsCount }}</b-badge>
          </span>
          <span v-if="idea.problemsCount > 0" class="font-15x ml-2">
            <b-badge variant="danger">{{ idea.problemsCount }}</b-badge>
          </span>
          <!-- <span
            v-if="idea.hasFile"
            class="text-gray font-15x ml-2"
            style="position: relative; top: 1px"
          >
            <i class="mdi mdi-folder-open-outline"></i>
          </span> -->
        </div>
      </b-card-footer>
    </div>
  </b-card>
</template>
<script>
import { mapGetters } from "vuex";
import feedbackForm from "../../../../components/global/FeedbackForm.vue";
import GQLForm from "@/lib/gqlform";

/* eslint-disable */
export default {
  components: {
    "idea-feedback": feedbackForm,
  },
  props: {
    idea: {
      required: false,
    },
  },
  data: () => ({
    showPopOverFeedback: false,
  }),
  mounted() {
    const route = this.$router.currentRoute;
    if (route.query) {
      if (route.query.uuid) {
        if (this.idea.uuid == route.query.uuid) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.toggleIdea();
            }, 1000);
          });
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      allProcess: "process/all",
      ideaReplies: "ideaIssueReply/all",
      user: "auth/user",
      ideaInEdit: "idea/ideaInEdit",
    }),
    getIdeaInEditId: {
      get() {
        return this.ideaInEdit?.editIdeaId ?? null;
      },
    },
    showDetail: {
      get() {
        let openState = false;
        if (this.idea && this.idea.id && this.getIdeaInEditId) {
          openState = this.getIdeaInEditId === this.idea.id;
        }
        return openState;
      },
    },
    process: {
      get() {
        return this.allProcess.find((p) => p.id === this.idea.processId);
      },
    },
    stage: {
      get() {
        return this.process
          ? this.process.stages.find(
              (p) => p.id === this.idea.parentStructure.stageId
            )
          : null;
      },
    },
    operation: {
      get() {
        return this.stage
          ? this.stage.operations.find(
              (p) => p.id === this.idea.parentStructure.operationId
            )
          : null;
      },
    },
    phase: {
      get() {
        return this.operation
          ? this.operation.phases.find(
              (p) => p.id === this.idea.parentStructure.phaseId
            )
          : null;
      },
    },
  },

  methods: {
    async openIdeaEdit(idea) {

      // this.$router.push({
      //   params: {
      //     ideaId: idea.id,
      //   },
      // });

      await this.$store.dispatch("idea/setIdeaInEdit", {
        editIdeaMeta: {
          editStartedAt: new Date().getTime(),
        },
        editIdeaMode: "EDIT",
        editIdeaId: idea.id,
      });
      this.$emit("openIdea", idea);
    },
    async closeIdeaForFeedback() {
      const ideaCloseForm = new GQLForm({
        ideaId: this.idea.id,
      });
      await this.$store.dispatch("idea/closeFeedback", ideaCloseForm);
      this.closePopovers();
    },
    closePopovers() {
      this.showPopOverFeedback = false;
    },
    togglePopOverFeedback() {
      this.showPopOverFeedback = !this.showPopOverFeedback;
    },
    async saveIdeaReply(input) {
      const status = "FEEDBACK";
      const ideaReplyForm = new GQLForm({
        authorId: this.user.id,
        typeAuthorId: input.typeAuthorId,
        ideaId: this.idea.id,
        value: input.value,
        description: input.description,
        status,
      });
      await this.$store.dispatch("ideaIssueReply/create", ideaReplyForm);
      await this.$store.dispatch("idea/findById", {
        id: this.idea.id,
        force: true,
      });

      /*  this.togglePopOverFeedback(); */
      this.showPopOverFeedback = false;
    },
    async setCurrentTool(event, toolId) {
      event.preventDefault();
      this.$store.dispatch("companyTool/setCurrent", {
        section: "toolIdeas",
        tool: { id: toolId },
      });
    },
    calcEvaluationAvg() {
      if (
        this.idea.evaluationsCount > 0 &&
        this.idea.evaluationSum != null &&
        this.idea.evaluationSum != 0
      ) {
        return this.idea.evaluationSum / 100 / this.idea.evaluationsCount;
      }
      return 0;
    },
    async toggleIdea() {
      if (this.idea) {
        await this.$store.dispatch("process/setCurrentProcess", {
          section: "ideas",
          process: this.process,
          stage: this.stage,
          operation: this.operation,
          phase: this.phase,
        });

        await this.openIdeaEdit(this.idea);
      }
    },
    async breadcrumbClick(event, section) {
      event.preventDefault();
      switch (section) {
        case "process":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process,
            stage: null,
            operation: null,
            phase: null,
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process,
            stage: this.stage,
            operation: null,
            phase: null,
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process,
            stage: this.stage,
            operation: this.operation,
            phase: null,
          });
          break;
        case "phase":
          this.$store.dispatch("process/setCurrentProcess", {
            section: "ideas",
            process: this.process,
            stage: this.stage,
            operation: this.operation,
            phase: this.phase,
          });
          break;
      }
    },
  },
};
</script>

<style>
.idea-card-shrunk {
  border: 1px solid #d0cccc;
}
.idea-card-expanded {
  border: none;
  background: transparent;
}
</style>
