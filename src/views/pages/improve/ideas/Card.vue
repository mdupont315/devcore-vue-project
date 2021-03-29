<template>
  <b-card :id="'idea-card-' + idea.id" no-body class="border mb-3 idea-card">
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
        :time="idea.createdAt"
        class="d-inline-block"
      ></author-time>
      <div class="info float-right">
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
        <span
          v-if="idea.hasFile"
          class="text-gray font-15x ml-2"
          style="position: relative; top: 1px"
        >
          <i class="mdi mdi-folder-open-outline"></i>
        </span>
      </div>
    </b-card-footer>
    <b-row>
      <b-modal
        v-model="showDetail"
        :title="idea.title"
        size="lg modal-idea-card col-6"
        hide-footer
      >
        <idea-detail
          v-if="showDetail"
          ref="detail"
          :idea="idea"
          @closed="toggleIdea"
        ></idea-detail>
      </b-modal>
    </b-row>
  </b-card>
</template>
<script>
import { mapGetters } from "vuex";
import IdeaDetail from "./Detail";
/* eslint-disable */
export default {
  components: {
    "idea-detail": IdeaDetail,
  },
  props: {
    idea: {
      required: false,
    },
  },
  data: () => ({
    showDetail: false,
  }),
  computed: {
    ...mapGetters({
      allProcess: "process/all",
    }),
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
    toggleIdea() {
      this.showDetail = !this.showDetail;
      if (this.showDetail) {
        this.$nextTick(() => {
          this.$refs.detail.$el.scrollIntoView();
          document.getElementById("main-content").scrollTop -= 55;
          // document.getElementById("main-content").style.overflowY="hidden";
        });
      } else {
        document.getElementById("main-content").style.overflowY = "auto";
      }
    },
    breadcrumbClick(event, section) {
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
