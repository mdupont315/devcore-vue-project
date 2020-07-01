<template>
  <div class="card border py-2 mb-2 shadow-sm project-card" :class="{expanded:expanded}">
    <layer style="width:100%" v-if="editing" @closed="toggleEdit">
      <b-card style="top:-7px;width:300px">
        <project-form v-model="editItem" mode="edit" @done="toggleEdit"></project-form>
      </b-card>
    </layer>
    <div class="card-header header">
      <h3 class="h5 m-0 text-capitalize text-overflow text-bold">{{ item.name }}</h3>
      <div class="tools">
        <span class="btn-action" @click="toggleEdit" v-if="$can('core/project/update', item)">
          <i class="mdi mdi-pencil"></i>
        </span>
      </div>
    </div>
    <div class="card-body py-2">
      <div>
        <span
          class="project-status"
          :class="'project-status-'+stage.status.replace(' ', '_').toLowerCase()"
        >{{ stage.status }}</span>
        <div class="stats" @click.stop="toggle">
          <div class="content">
            <span
              class="percent"
              v-if="item.hasReviews"
              :class="{negative: item.getStageConsolidatedPercent(stage.id)<0}"
            >{{item.getStageConsolidatedPercent(stage.id)>=0?'+':''}}{{ item.getStageConsolidatedPercent(stage.id) | numberFormat('0.00') }} %</span>
          </div>
        </div>
      </div>
      <div class="details">
        <div v-if="!detailsForm.busy">
          <!-- <div v-if="stage.status!=='STARTED'"> -->
          <div
            class="card bg-primary rounded-0 text-white mt-3 mb-0 ideas detail-card"
            v-if="stage.ideas.length > 0"
          >
            <div class="card-body px-3 py-2">
              <layer v-if="showIdeas" @closed="toggleIdeas">
                <div class="details-popup">
                  <idea-table
                    :project="item"
                    :stage="stage"
                    :items="item.getIdeasByStage(stage.id)"
                    @closed="toggleIdeas"
                  ></idea-table>
                </div>
              </layer>
              <strong class="h5 d-block mb-0">{{ $t('Ideas') }}</strong>
              <span
                class="text-light"
              >{{ $tc('idea.count', item.getIdeasByStage(stage.id).length) }}</span>
              <span
                class="summary"
                @click.stop="toggleIdeas"
              >{{ item.getIdeasImpactByStage(stage.id)>=0?'+':''}}{{ item.getIdeasImpactByStage(stage.id) | numberFormat('0.00') }}%</span>
            </div>
          </div>
          <div
            class="card bg-danger rounded-0 text-white mt-0 issues detail-card"
            v-if="item.issues.filter(o=>o.projectStageId===stage.id).length > 0"
          >
            <div class="card-body px-3 py-2">
              <layer v-if="showIssues" @closed="toggleIssues">
                <div class="details-popup">
                  <issue-table
                    :project="item"
                    :stage="stage"
                    :items="item.getIssuesByStage(stage.id)"
                    @closed="toggleIssues"
                  ></issue-table>
                </div>
              </layer>
              <strong class="h5 d-block mb-0">{{ $t('Issues') }}</strong>
              <span
                class="text-light"
              >{{ $tc('issue.count', item.getIssuesByStage(stage.id).length) }}</span>
              <span
                class="summary"
                @click.stop="toggleIssues"
              >{{item.getIssuesImpactByStage(stage.id)>=0?'+':''}}{{ item.getIssuesImpactByStage(stage.id) | numberFormat('0.00') }} %</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center p-3">
          <b-spinner variant="primary"></b-spinner>
        </div>
        <div class="mt-3" v-if="stage.status==='EVALUATIONS_PENDING'">
          <loading-button
            size="lg"
            block
            :loading="form.busy"
            @click="completeStage"
          >{{ $t('action.close', {name:$t('stage')}) }}</loading-button>
        </div>
        <div class="mt-3" v-if="stage.status==='STARTED' && item.type==='NORMAL'">
          <loading-button
            size="lg"
            block
            :loading="form.busy"
            @click="nextStage"
          >{{ $t('action.next', {name:$t('stage')}) }}</loading-button>
        </div>

        <div class="mt-3" v-if="stage.status==='STARTED' && item.type==='ON_GOING'">
          <loading-button
            size="lg"
            block
            :loading="form.busy"
            @click="completeStage"
          >{{ $t('action.evaluate', {name:$t('stage')}) }}</loading-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import ProjectForm from "../Form";
import IssueTable from "./IssueTable";
import IdeaTable from "./IdeaTable";
export default {
  components: {
    "project-form": ProjectForm,
    "idea-table": IdeaTable,
    "issue-table": IssueTable,
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    stage: {
      type: Object,
      required: true
    },
    expanded: {
      required: false,
      type: Boolean,
      default: () => true
    }
  },
  data: () => ({
    dataExpanded: false,
    form: {},
    editing: false,
    editItem: null,
    dataItem: null,
    detailsForm: {},
    showIdeas: false,
    showIssues: false
  }),
  mounted() {},
  methods: {
    async toggle() {
      this.$emit("toggled", this.item, this.stage);
      await this.loadDetails();
    },
    initEdit() {
      this.editItem = {
        id: this.item.id,
        ideaIds: this.item.ideas.map(i => i.ideaId),
        toolIds: this.item.companyTools.map(i => i.id),
        userIds: this.item.users.map(i => i.id),
        name: this.item.name,
        budget: this.item.budget,
        process: this.item.process.id,
        stage: this.stage.id
      };
    },
    async toggleEdit() {
      if (!this.editing) {
        await this.loadDetails();
        this.initEdit();
      }

      this.editing = !this.editing;
    },
    async loadDetails() {
      this.detailsForm = {
        id: this.item.id,
        busy: false
      };
      await this.$store.dispatch("project/findById", this.detailsForm);
    },
    async nextStage() {
      this.form = new GQLForm({
        id: this.item.id
      });
      await this.$store.dispatch("project/nextStage", this.form);
      this.$emit("changed", this.item);
    },
    async completeStage() {
      this.form = new GQLForm({
        id: this.item.id,
        stageId: this.stage.id
      });
      await this.$store.dispatch("project/completeStage", this.form);
      this.$emit("changed", this.item);
    },
    async toggleIdeas() {
      this.showIdeas = !this.showIdeas;
      this.$emit("itemDetailsToggled", this.showIdeas, this.item, this.stage);
    },
    async toggleIssues() {
      this.showIssues = !this.showIssues;
      this.$emit("itemDetailsToggled", this.showIssues, this.item, this.stage);
    }
  }
};
</script>