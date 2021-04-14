<template>
  <div class="page animated fadeIn">
    <div
      v-if="currentItem || currentRowDetails"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>

    <div class="container-fluid">
      <!-- page content -->
      <b-card>
        <b-table
          sort-icon-left
          sort-by="name"
          :busy="filter.busy"
          class="t01"
          primary-key="rowId"
          hover
          :fields="fields"
          :items="items"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
          :tbody-tr-class="
            (item) => (item && item._isActive ? 'editing' : 'not-editing')
          "
        >
          <template v-slot:table-colgroup>
            <col style="width: 35%" />
            <col style="width: 20%" />
            <col style="width: 10%" />
            <col style="width: 10%" />
            <col style="width: 300px" />
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
          <template v-slot:cell(name)="row"> {{ row.item.title }}</template>

          <!-- companyRole -->
  <!--         <template v-slot:cell(companyRole)="row">{{
            row.item.companyRole.name
          }}</template> -->

          <!-- loss -->
          <template v-slot:cell(issues)="row">{{
            row.item.issues.length
          }}</template>

          <!-- loss -->
          <template v-slot:cell(loss)="row">
            <span :class="{ 'text-danger': row.item.totalLoss != 0 }">{{
              $currency(row.item.totalLoss / 100 || 0)
            }}</span>
          </template>

          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <div v-if="isRowEditing(row)" class="text-right buttons">
              <div class="d-flex" style="margin-top: 2px">
                <b-button
                  :ref="`btnNewIdea${row.item.rowId}`"
                  size="xs"
                  variant="action"
                  class="btn-primary btn-block text-uppercase text-bold"
                  style="font-size: 1.2rem; padding: 3px"
                  @click="newIdea(row)"
                  >{{ $t("New idea") }}</b-button
                >

                <b-popover
                  ref="popover"
                  :target="() => $refs[`btnNewIdea${row.item.rowId}`]"
                  :show.sync="showIdeaPopover"
                  placement="bottom"
                  class="form-popover"
                >
                  <b-card no-body style="width: 300px">
                    <b-card-body>
                      <idea-form
                        section="issues"
                        :item="idea"
                        @done="closeIdeaForm"
                      ></idea-form>
                    </b-card-body>
                  </b-card>
                </b-popover>
                <b-button
                  size="xs"
                  variant="transparent"
                  class="btn-link text-gray btn-block text-uppercase text-bold shadow-0"
                  style="font-size: 1rem; padding: 3px; margin: 0"
                  @click="toggleItem(null)"
                  >{{ $t("Cancel") }}</b-button
                >
              </div>
            </div>
            <div v-else class="buttons">
              <b-button
                size="xs"
                variant="action"
                class="btn-primary btn-block text-uppercase text-bold"
                style="font-size: 1.2rem; padding: 3px"
                @click="newIdea(row)"
                >{{ $t("New idea") }}</b-button
              >
              <b-button
                v-if="$can('process/process/manage')"
                size="xs"
                variant="action"
                class="btn-light btn-expand btn-block text-uppercase text-bold m-0"
                style="font-size: 1.2rem; padding: 3px"
                @click="showDetails(row)"
                >{{
                  row.item._showDetails ? $t("Close") : $t("Details")
                }}</b-button
              >
            </div>
          </template>

          <!-- details -->
          <template v-slot:row-details="row">
            <div class="row-details">
              <issues-table
                :items="row.item.issues"
                :item="row.item"
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
      idea: {},
      deleting: false,
      updateForm: null,
      currentItems: [],
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      loadingItem: false,
      showIdeaPopover: false,
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
    process: {
      get() {
        return this.currentProcess("issues").process;
      },
    },
    items: {
      get() {
        let items = [];

        if (this.process) {
          this.process.stages.map((s) => {
            s.companyRolesWithChild.map((o) => {
              const id = `${s.id}_${o.id}`;
              const it = { ...s };
              it.companyRole = o;
              it.rowId = id;
              it.totalLoss = 0;
              it.issues = this.issues.filter((is) => {
                return is.stageId == s.id && is.author.companyRoleId == o.id;
              });

              console.log("*** Support Issues ***");

              it.issues.map((is) => {
                it.totalLoss += is.totalValue;
              });

              if (this.currentItem) {
                it._isActive = this.currentItem.rowId === it.rowId;
              }

              if (this.currentRowDetails) {
                it._showDetails =
                  this.currentRowDetails.item.rowId === it.rowId;
              }

              items.push(it);
            });
          });
        }

        if (this.filterValue) {
          items = items.filter((is) => {
            return (
              is.title.toLowerCase().includes(this.filterValue.toLowerCase()) ||
              is.companyRole.name
                .toLowerCase()
                .includes(this.filterValue.toLowerCase())
            );
          });
        }

        return items.filter((it) => it.issues.length > 0);
      },
    },
    issues: {
      get() {
        if (this.process) {
          return this.$store.getters["issue/byProcess"](this.process.id);
        }
        return [];
      },
    },
    fields: {
      get() {
        return [
          { key: "name", label: this.$t("Process Part"), sortable: true },
        /*   {
            key: "companyRole",
            label: this.$t("Role"),
            sortable: true,
          }, */
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
      await this.$store.dispatch("process/findById", {
        id: this.process.id,
        force: true,
      });
      await this.$store.dispatch("issue/findByProcess", {
        id: this.process.id,
        force: true,
      });
    }
  },
  methods: {
    isRowEditing(row) {
      return (
        row &&
        this.currentItem &&
        row.item &&
        row.item.rowId == this.currentItem.rowId
      );
    },
    newIdea(row) {
      this.idea = {
        procesId: row.item.processId,
        stageId: row.item.id,
      };
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
    async saveItem(form) {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("companyTool/update", form);
        this.toggleItem(null);
      }
    },

    async loadItem(item) {
      try {
        if (!item.issues) {
          this.loadingItem = true;
        }
        await this.$store.dispatch("issue/findByStage", {
          id: item.id,
        });
      } finally {
        this.loadingItem = false;
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
        await this.loadItem(row.item);
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
    itemChanged(item) {
      if (item) {
        this.loadItem(item);
      }
    },
  },
};
</script>
