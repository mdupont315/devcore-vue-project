<template>
  <div class="page animated fadeIn" ref="animated">
    <div
      v-if="currentItem || (currentRowDetails && getIssues.length)"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>

    <div class="container-fluid" ref="issues_main_page">
      <!-- page content -->
      <b-card>
        <b-table
          sort-icon-left
          sort-by="name"
          :busy="filter.busy"
          class="t01"
          hover
          :fields="fields"
          :items="uniqueProcessPathIds"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
          :tbody-tr-class="
            (item) => (item && item._isActive ? 'editing' : 'not-editing')
          "
        >
          <template v-slot:table-colgroup>
            <col style="width: 25%" />
            <col style="width: 25%" />
            <col style="width: 25%" />
            <col style="width: 25%" />
          </template>
          <template v-slot:empty="scope">
            <p class="alert alert-warning text-center">{{ scope.emptyText }}</p>
          </template>
          <template v-slot:table-busy>
            <div class="text-center text-primary my-2">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <!-- name -->
          <template v-slot:cell(name)="row">
            <div style="min-height: 40px" class="issueTable_processPath_title">
              <div v-if="row.item.stageId" class="issueTable_processPath_title">
                {{ row.item.pathTitles.stage }}
              </div>
              <div
                v-if="row.item.operationId"
                class="issueTable_processPath_title"
              >
                <div style="font-size: 20px; padding: 5px">/</div>
                {{ row.item.pathTitles.operation }}
              </div>
              <div v-if="row.item.phaseId" class="issueTable_processPath_title">
                <div style="font-size: 20px; padding: 5px">/</div>
                <div>{{ row.item.pathTitles.phase }}</div>
              </div>
            </div>
          </template>

          <!-- loss -->
          <template v-slot:cell(issues)="row">
            <div v-if="row.item.pathIssues">
              {{ row.item.pathIssues.length }}
            </div>
            <div v-else>0</div>
          </template>

          <!-- loss -->
          <template v-slot:cell(loss)="row">
            <span :class="{ 'text-danger': row.item.pathStats != 0 }">
              {{ $currency(getTotalIssueLoss(row.item)) }}
            </span>
          </template>

          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <div
              v-if="isRowEditing(row)"
              class="text-right buttons"
              style="height: 100%"
            >
              <inner-overlay
                v-if="showIdeaPopover"
                @click="showIdeaPopover = !showIdeaPopover"
                style="z-index: 1"
              >
              </inner-overlay>
              <div
                class="d-flex"
                style="align-items: center; width: 100%; height: 100%"
              >
                <b-button
                  :ref="`btnNewIdea${row.item.rowId}`"
                  size="xs"
                  variant="action"
                  class="btn-primary btn-block text-uppercase text-bold"
                  style="
                    font-size: 1.2rem;
                    padding: 3px;
                    min-width: min-content;
                    max-height: 32px;
                  "
                  @click="newIdea(row)"
                  >{{ $t("New idea") }}</b-button
                >

                <b-popover
                  ref="popover"
                  :target="() => $refs[`btnNewIdea${row.item.rowId}`]"
                  triggers="click"
                  :show.sync="showIdeaPopover"
                  placement="bottom"
                  class="form-popover"
                >
                  <b-card
                    no-body
                    style="width: 300px"
                    v-if="showIdeaPopover && row.item"
                  >
                    <b-card-body>
                      <idea-form
                        section="issues"
                        :issueIdea="{
                          processId: process.id,
                          stageId: row.item.stageId,
                          operationId: row.item.operationId,
                          phaseId: row.item.phaseId,
                        }"
                        @done="closeIdeaForm"
                      ></idea-form>
                    </b-card-body>
                  </b-card>
                </b-popover>
                <b-button
                  size="xs"
                  variant="transparent"
                  class="
                    btn-link
                    text-gray
                    btn-block
                    text-uppercase text-bold
                    shadow-0
                  "
                  style="
                    font-size: 1rem;
                    padding: 3px;
                    margin: 0;
                    min-width: min-content;
                  "
                  @click="toggleItem(null)"
                  >{{ $t("Cancel") }}</b-button
                >
              </div>
            </div>
            <div v-else class="buttons" style="height: 100%">
              <b-button
                size="xs"
                variant="action"
                class="btn-primary btn-block text-uppercase text-bold"
                style="font-size: 1.2rem; 3px 10px;white-space: nowrap;"
                @click="newIdea(row)"
                >{{ $t("New idea") }}</b-button
              >
              <b-button
                v-if="$can('process/process/manage')"
                size="xs"
                variant="action"
                class="
                  btn-light btn-expand btn-block
                  text-uppercase text-bold
                  m-0
                "
                style="font-size: 1.2rem; 3px 10px;white-space: nowrap;"
                @click="showDetails(row)"
                >{{
                  row.item._showDetails ? $t("Close") : $t("Details")
                }}</b-button
              >
            </div>
          </template>

          <!-- details -->
          <template v-slot:row-details="currentRowDetails">
            <div class="row-details" v-if="currentRowDetails">
              <issues-table
                @deleted="deleted"
                :items="currentRowDetails.item.pathIssues"
                :item="currentRowDetails.item"
                :loading="loadingItem"
              ></issues-table>
            </div>
          </template>
        </b-table>
      </b-card>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import IdeaForm from "../../improve/ideas/Form";
import IssuesTable from "./IssuesTable";

export default {
  components: {
    "idea-form": IdeaForm,
    "issues-table": IssuesTable,
  },
  data: () => {
    return {
      ideaFromIssue: {},
      deleting: false,
      updateForm: null,
      currentItems: [],
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      loadingItem: false,
      showIdeaPopover: false,
      uniquePathIssues: null,
      filter: {
        busy: false,
      },
      toolOptions: null,
    };
  },
  computed: {
    ...mapGetters({
      loading: "issue/loading",
      issues: "issue/filteredItems",
      filterValue: "issue/filter",
      currentProcess: "process/current",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
    }),

    /*   getAvailablePaths() {
      const available = {
        stages: [],
        operations: [],
        phases: [],
      };

      if (this.process.stages.length > 0) {
        available.stages = this.process.stages.forEach((stage) => {
          available.stages.push(stage.id);

          if (stage.operations.length > 0) {
            stage.operations.forEach((operations) => {
              operations
            });
          }
        });
      }

      console.log(available);
      console.log(this.process.stages);
      this.process.stages;
      return available;
    }, */
    getIssues: {
      get() {
        if (this.process) {
          return this.$store.getters["issue/byProcess"](this.process.id).filter(
            (x) => x.parent
          );
        }
        return [];
      },
    },

    uniqueProcessPathIds: {
      get: function () {
        //Deduct all populated paths from ideas
        const populatedProcessPaths = [];
        this.getIssues.map((_issue) => {
          const issue = this.issuePathDeducer(_issue);
          if (issue) populatedProcessPaths.push(issue);
        });

        if (!populatedProcessPaths || populatedProcessPaths.length == 0) {
          return [];
        }

        const uniquePaths = Array.from(
          new Set(populatedProcessPaths.map((obj) => JSON.stringify(obj)))
        ).map((str) => JSON.parse(str));

        return this.getUniquePaths(uniquePaths);
      },
      set: function (uniqPaths) {
        this.uniquePathIssues = uniqPaths;
      },
    },
    process: {
      get() {
        return this.currentProcess("issues").process;
      },
    },

    fields: {
      get() {
        return [
          { key: "name", label: this.$t("Process Part"), sortable: true },
          {
            key: "issues",
            label: this.$t("Issues"),
            sortable: true,
          },
          {
            key: "loss",
            label: this.$t("Loss"),
            sortable: true,
          },
          { key: "actions", label: this.$t("Manage"), class: "actions" },
        ];
      },
    },
  },
  async mounted() {
    if (this.process) {
      await this.loadProcessAndIssues();
    }
  },

  methods: {
    deleted(item) {
      if (
        this.currentRowDetails &&
        this.currentRowDetails.item &&
        this.currentRowDetails.item.pathIssues
      ) {
        if (this.currentRowDetails.item.pathIssues.length > 0) {
          this.currentRowDetails.item.pathIssues =
            this.currentRowDetails.item.pathIssues.filter(
              (x) => x.id !== item.id
            );
        }
      }
    },
    doesProcessPathExist(path) {
      const { stageId } = path;
      const { operationId } = path;
      const { phaseId } = path;

      if (!!stageId && !!operationId && !!phaseId) {
        const stage = this.process.stages.find((s) => s.id == stageId);
        const operation =
          stage?.operations.find((o) => o.id == operationId) ?? false;
        const phase = operation?.phases.find((p) => p.id == phaseId) ?? false;
        return stage && operation && phase;
      } else if (!!stageId && !!operationId && !phaseId) {
        const stage = this.process.stages.find((s) => s.id == stageId);
        const operation =
          stage?.operations.find((o) => o.id == operationId) ?? false;
        const phase = operation?.phases.find((p) => p.id == phaseId) ?? false;
        return stage && operation && !phase;
      } else if (!!stageId && !operationId && !phaseId) {
        const stage = this.process.stages.find((s) => s.id == stageId);
        const operation =
          stage.operations?.find((o) => o.id == operationId) ?? false;
        const phase = operation.phases?.find((p) => p.id == phaseId) ?? false;
        return stage && !operation && !phase;
      }

      return false;
    },
    getTotalIssueLoss(item) {
      let total = 0;
      if (item.pathIssues && item.pathIssues.length > 0) {
        item.pathIssues.forEach((issue) => {
          total += issue.effectedMoneyTotalValue;
        });
      }
      return total < 0 ? total / 100 : 0;
    },

    getUniquePaths(processPaths = []) {
      if (processPaths.length < 1) return [];
      const paths = processPaths.filter((p) => this.doesProcessPathExist(p));

      let modified = paths.map((path, index) => ({
        id: index,
        stageId: path.stageId,
        operationId: path.operationId,
        phaseId: path.phaseId,
        rowId: this.getRowId(path),
        pathIssues: this.getIssuesForKnownPath(path),
        pathTitles: this.getPathTitles(path),
        _showDetails: this.isRowOpen(index),
      }));

      if (this.currentRowDetails) {
        if (!modified.some((i) => i.id == this.currentRowDetails.index)) {
          this.currentRowDetails = null;
        }
      }

      return modified.filter((issuePaths) => issuePaths.pathIssues.length > 0);
    },
    isRowOpen(index) {
      if (this.currentRowDetails) {
        if (
          index === this.currentRowDetails.index &&
          this.currentRowDetails.item.pathIssues.length > 0
        ) {
          return true;
        }
      }
      return false;
    },
    getRowId(path) {
      const stageId = path.stageId;
      const operationId = path.operationId ?? 0;
      const phaseId = path.phaseId ?? 0;

      return `${stageId}${operationId}${phaseId}`;
    },
    issuePathDeducer(_obj) {
      if (!_obj.parent) return;
      if (_obj.parent.__typename === "ProcessPhase") {
        const phaseId = _obj.parent.id;
        const operationId = _obj.parent.operation.id;
        const stageId = _obj.parent.operation.stageId;
        return {
          phaseId: phaseId,
          operationId: operationId,
          stageId: stageId,
        };
      }
      if (_obj.parent.__typename === "ProcessOperation") {
        const operationId = _obj.parent.id;
        const stageId = _obj.parent.stageId;
        return {
          operationId: operationId,
          stageId: stageId,
        };
      }
      if (_obj.parent.__typename === "ProcessStage") {
        const stageId = _obj.parent.id;
        return {
          stageId: stageId,
        };
      }
    },
    getPathTitles(path) {
      const getTitle = (path) => {
        this.mappedProcessPaths = {
          stage: null,
          operation: null,
          phase: null,
        };

        const { stageId } = path;
        const { operationId } = path;
        const { phaseId } = path;

        let mappedStage = null;
        let mappedOperation = null;
        let mappedPhase = null;

        if (stageId) {
          mappedStage = this.process.stages.find(
            (stage) => stage.id == stageId
          );
          this.mappedProcessPaths.stage = mappedStage.title;
        }

        if (operationId) {
          mappedOperation = mappedStage.operations.find(
            (operation) => operation.id == operationId
          );
          this.mappedProcessPaths.operation = mappedOperation.title;
        }

        if (phaseId) {
          mappedPhase = mappedOperation.phases.find(
            (phase) => phase.id == phaseId
          );
          this.mappedProcessPaths.phase = mappedPhase.title;
        }

        return this.mappedProcessPaths;
      };

      return getTitle(path);
    },
    getIssuesForKnownPath(path) {
      let selectedIssues = [];
      if (path) {
        const { stageId } = path;
        const { operationId } = path;
        const { phaseId } = path;

        if (phaseId) {
          selectedIssues = this.getIssues.filter(
            (i) =>
              i.parent.id == phaseId && i.parent.__typename == "ProcessPhase"
          );
        }

        if (operationId && !phaseId) {
          selectedIssues = this.getIssues.filter(
            (i) =>
              i.parent.id == operationId &&
              i.parent.__typename == "ProcessOperation"
          );
        }
        if (!operationId && !phaseId) {
          selectedIssues = this.getIssues.filter(
            (i) =>
              i.parent.id == stageId && i.parent.__typename == "ProcessStage"
          );
        }
      }
      return selectedIssues;
    },
    async loadProcessAndIssues() {
      await this.$store.dispatch("process/findById", {
        id: this.process.id,
        force: true,
      });
      await this.$store.dispatch("issue/findByProcess", {
        id: this.process.id,
        force: true,
      });
    },
    isRowEditing(row) {
      return (
        row &&
        this.currentItem &&
        row.item &&
        row.item.rowId == this.currentItem.rowId
      );
    },
    newIdea(row) {
      this.currentItem = row.item;
      this.currentItem._isActive = true;
      this.showIdeaPopover = true;
    },
    closeIdeaForm() {
      this.showIdeaPopover = false;
      this.currentItem._isActive = false;
      if (!this.currentRowDetails) {
        this.currentItem = null;
      }
    },
    overlayClick() {
      if (this.currentItem) {
        this.toggleItem(null);
      } else {
        this.showDetails(null);
      }
    },

    async showDetails(row) {
      if (this.currentRowDetails && this.currentRowDetails.item) {
        this.currentRowDetails.item._showDetails = false;
      }
      this.$store.dispatch("app/toggleInnerOverlay");
      if (
        row != null &&
        (!this.currentRowDetails ||
          this.currentRowDetails.item.id != row.item.id)
      ) {
        this.currentRowDetails = row;
        this.currentRowDetails.toggleDetails();
        this.currentRowDetails.item._showDetails = true;
      } else {
        this.currentRowDetails = null;
      }
    },
    toggleItem(item) {
      this.showIdeaPopover = false;
      this.$validator.pause();
      this.$validator.reset();
      if (
        !item ||
        (this.currentItem && this.currentItem.rowId === item.rowId)
      ) {
        this.currentItem._isActive = false;
        this.currentItem = null;
        this.updateForm = null;
        this.deleting = false;
      } else {
        this.updateForm = new GQLForm({
          id: item.id,
          name: item.name,
          yearlyCosts: item.yearlyCosts,
          priceModel: item.priceModel ? item.priceModel.id : null,
          tool: item.toolId,
        });
        this.currentItem = item;
        this.$validator.reset();
        this.$validator.resume();
      }
      this.$store.dispatch("app/toggleInnerOverlay");
    },
  },
};
</script>
<style scoped>
.issueTable_processPath_title {
  display: flex;
  align-items: center;
}

.row-details {
  overflow: hidden auto;
}
</style>
