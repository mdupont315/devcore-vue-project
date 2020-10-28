<template>
  <div class="idea-detail">
    <b-card no-body v-if="idea" class="rounded">
      <b-card-header>
        <div style="line-height:1em">
          <nav aria-label="breadcrumb" class="m-0 p-0 d-inline-block">
            <ol class="breadcrumb text-capitalizes bg-transparent m-0 p-0">
              <li class="breadcrumb-item text-overflow" v-if="process">
                <i class="mdi mdi-flask-empty text-gray"></i> &nbsp;
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'process')"
                >{{ process.title }}</a>
              </li>
              <li class="breadcrumb-item text-overflow" v-if="stage">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'stage')"
                >{{ stage.title }}</a>
              </li>
              <li class="breadcrumb-item text-overflow" v-if="operation">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'operation')"
                >{{ operation.title }}</a>
              </li>
              <li class="breadcrumb-item text-overflow" v-if="phase">
                <a
                  href
                  class="text-gray"
                  @click.stop="breadcrumbClick($event, 'phase')"
                >{{ phase.title }}</a>
              </li>
              <li class="breadcrum-item text-overflow ml-1" v-if="idea.tool && idea.tool.id">
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
        </div>
      </b-card-header>

      <div
        v-if="idea.hasReviews"
        class="bg-gray d-flex flex-column justify-content-center"
        style="min-height:200px"
      >
       
        <report-chart :idea="idea"></report-chart>
      </div>

      <perfect-scrollbar style="max-height:200px">
        <b-card-body class="p-5" :class="{'bg-gray': !idea.hasReviews}">
          <h3 class="h6 text-uppercase">{{ $t('Idea description') }}</h3>
          <p class="text-gray text-justify">{{ idea.description || $t('No description') }}</p>
        </b-card-body>
      </perfect-scrollbar>
      <b-card-footer class="p-3 pb-5">
        <div class="footer-details d-flex flex-row mb-4">
          <div class="files border-right px-4" style="width:50%">
            <h4 class="h6 text-uppercase text-left">{{ $t('Guide') }}</h4>
            <ul class="list-unstyled" v-if="idea.hasFile">
              <li class="list-item font-13x text-gray" v-for="file in idea.files" :key="file.id">
                <a class="text-gray" :href="file.downloadUrl" target="_blank">
                  <i class="mdi mdi-folder-open-outline"></i>
                  {{ $t('Download') }}
                </a>
              </li>
            </ul>
            <span v-else class="text-gray">{{ $t('No guide attached') }}</span>
          </div>
          <div class="author px-4" style="width:50%">
            <h4 class="h6 text-uppercase text-left">{{ $t('Submitted by') }}</h4>
            <author-time :user="idea.author" :time="idea.createdAt" class="d-inline-block"></author-time>
          </div>
        </div>
        <div class="text-center d-flex flex-row justify-content-center">
          <loading-button
            variant="primary"
            size="lg"
            :loading="editForm && editForm.busy"
            style="width:120px!important"
            v-if="idea.status==='NEW' && $can('improve/idea/change_status', idea)"
            @click="updateStatus"
          >{{ $t('Test') }}</loading-button>
          <loading-button
            variant="primary"
            size="lg"
            :loading="editForm && editForm.busy"
            style="width:120px!important"
            v-if="idea.status==='TESTING' && $can('improve/idea/change_status', idea)"
            @click="updateStatus"
          >{{ $t('Adopt') }}</loading-button>
          <b-button
            variant="outline-dark"
            size="lg"
            v-if="$can('improve/idea/update', idea)"
            class="ml-2"
            style="width:120px!important"
            @click="toggleEdit"
          >{{ $t('Edit') }}</b-button>
          <confirm-button
            v-if="$can('improve/idea/delete', idea)"
            variant="outline-dark"
            size="lg"
            class="ml-2"
            style="width:120px!important"
            :confirm-title="$t('Delete') + ' ' + idea.name + '?'"
            :confirm-message="$t('This action cannot be undone!')"
            @confirm="deleteItem"
          >{{ $t('Remove') }}</confirm-button>
        </div>
      </b-card-footer>
    </b-card>

    <div class="border-top">
      <b-col>
        <b-col cols="12 py-4 px-0" v-if="idea.improvementsCount>0">
          <h4 class="text-center mb-4">
            {{ $t('Improvements') }}
            <b-badge variant="primary">{{ idea.improvementsCount }}</b-badge>
          </h4>
          <div style="position:relative" class="w-100">
            <div v-if="idea.improvements">
              <improvement-card
                v-for="item in idea.improvements"
                :key="item.id"
                :item="item"
                :idea="idea"
              ></improvement-card>
            </div>
            <div v-else class="mx-auto text-center">
              <b-spinner class="mx-auto" variant="primary"></b-spinner>
            </div>
          </div>
        </b-col>
        <b-col
          cols="12 py-4 px-0"
          v-if="idea.problemsCount>0"
          :class="{'border-top':idea.improvementsCount>0}"
        >
          <h4 class="text-center mb-4">
            {{ $t('Problems') }}
            <b-badge variant="danger">{{ idea.problemsCount }}</b-badge>
          </h4>
          <div style="position:relative" class="w-100">
            <div v-if="idea.problems">
              <improvement-card
                v-for="item in idea.problems"
                :key="item.id"
                :item="item"
                :idea="idea"
              ></improvement-card>
            </div>
            <div v-else class="mx-auto text-center">
              <b-spinner class="mx-auto" variant="primary"></b-spinner>
            </div>
          </div>
        </b-col>
      </b-col>
    </div>
    <b-row>
      <b-modal
        v-model="editing"
        :title="$t('Edit idea')"
        size="lg modal-idea-card col-6"
        hide-footer
      >
        <idea-form
          class="idea-card v2 p-0"
          v-if="editing"
          :item="idea"
          @cancel="toggleEdit"
          @done="toggleEdit"
        ></idea-form>
      </b-modal>
    </b-row>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import IdeaForm from "./Form";
import ImprovementCard from "./ImprovementCard";
import IdeaReportChart from "./IdeaReportChart";
import { mapGetters } from "vuex";
export default {
  props: {
    idea: {
      required: false,
    },
  },
  components: {
    "idea-form": IdeaForm,
    "improvement-card": ImprovementCard,
    "report-chart": IdeaReportChart,
  },
  data: () => ({
    editing: false,
    editForm: null,
    storeName: "idea",
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
          ? this.process.stages.find((p) => p.id === this.idea.stageId)
          : null;
      },
    },
    operation: {
      get() {
        return this.stage
          ? this.stage.operations.find((p) => p.id === this.idea.operationId)
          : null;
      },
    },
    phase: {
      get() {
        return this.operation
          ? this.operation.phases.find((p) => p.id === this.idea.phaseId)
          : null;
      },
    },
  },
  async mounted() {
    this.storeName = this.idea.type === "PROCESS" ? "idea" : "toolIdea";
    await this.$store.dispatch(this.storeName + "/findById", {
      id: this.idea.id,
      force: true,
    });
  },
  methods: {
    closed() {
      this.$emit("closed");
    },
    toggleEdit() {
      this.editing = !this.editing;
    },
    async updateStatus() {
      this.editForm = new GQLForm({
        id: this.idea.id,
        status: this.idea.status === "NEW" ? "TESTING" : "ADOPTED",
      });
      await this.$store.dispatch(
        this.storeName + "/changeStatus",
        this.editForm
      );
      this.$store.dispatch(this.storeName + "/findByProcess", {
        id: this.idea.processId,
        force: true,
      });
      this.closed();
    },
    async deleteItem() {
      this.editForm = new GQLForm({
        id: this.idea.id,
      });
      await this.$store.dispatch(this.storeName + "/delete", this.editForm);
      this.$store.dispatch(this.storeName + "/findByProcess", {
        id: this.idea.processId,
        force: true,
      });
      this.$store.dispatch("process/findById", {
        id: this.idea.processId,
        force: true,
      });
      this.closed();
    },
    async setCurrentTool(event, toolId) {
      event.preventDefault();
      this.$store.dispatch("companyTool/setCurrent", {
        section: "toolIdeas",
        tool: { id: toolId },
      });
    },
    breadcrumbClick(event, section) {
      event.preventDefault();
      switch (section) {
        case "process":
          this.$store.dispatch("process/setCurrentProcess", {
            section: this.idea.type === "PROCESS" ? "ideas" : "toolIdeas",
            process: this.process,
            stage: null,
            operation: null,
            phase: null,
          });
          break;
        case "stage":
          this.$store.dispatch("process/setCurrentProcess", {
            section: this.idea.type === "PROCESS" ? "ideas" : "toolIdeas",
            process: this.process,
            stage: this.stage,
            operation: null,
            phase: null,
          });
          break;
        case "operation":
          this.$store.dispatch("process/setCurrentProcess", {
            section: this.idea.type === "PROCESS" ? "ideas" : "toolIdeas",
            process: this.process,
            stage: this.stage,
            operation: this.operation,
            phase: null,
          });
          break;
        case "phase":
          this.$store.dispatch("process/setCurrentProcess", {
            section: this.idea.type === "PROCESS" ? "ideas" : "toolIdeas",
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