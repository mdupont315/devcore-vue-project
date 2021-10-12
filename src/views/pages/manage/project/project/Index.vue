<template>
  <div class="page animated fadeIn">
    <div
      v-if="
        process && (!loading || (items.length > 0 && process.stages.length > 0))
      "
      class="editable-dashboard"
    >
      <div class="sortable-wrapper t01 horizontal">
        <div
          v-for="stage in process.stages"
          :key="stage.id"
          :ref="`stage_${stage.id}`"
          class="process-stage item sortable-item enable-drag"
        >
          <div class="card stage-card bg-light">
            <div>
              <div class="card-header header pt-3">
                <div class="title">
                  <h2
                    class="h5 m-0 text-capitalize text-center text-overflow text-bold"
                  >
                    {{ stage.title }}
                  </h2>
                </div>
              </div>
              <div
                v-if="getProjectFromStage(stage).length > 0"
                class="card-body"
              >
                  <project-card
                    v-for="project in getProjectFromStage(stage)"
                    :key="constructRefForItem(project, stage)"
                    :ref="constructRefForItem(project, stage)"
                    :item="project"
                    :stage="project.getStage(stage.id)"
                    :expanded="
                      currentItem &&
                      currentItem.id === project.getStage(stage.id).id
                    "
                    @itemChanged="itemChanged"
                    @toggled="itemToggled"
                    @itemDetailsToggled="itemDetailsToggled"
                  ></project-card>
              </div>
              <div v-else class="card-body">
                <empty-slot></empty-slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <page-loader v-if="loading && items.length == 0"></page-loader>
    <empty-page
      v-if="!loading && (!process || process.stages.length === 0)"
    ></empty-page>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import ProjectCard from "./Card";
import { scrollLeftToElement } from "@/lib/utils";

export default {
  components: {
    "project-card": ProjectCard,
  },
  data: () => {
    return {
      deleting: false,
      updateForm: null,
      currentItem: null,
      loadingItem: false,
      filter: {
        busy: false,
      },
      toolOptions: null,
    };
  },
  computed: {
    ...mapGetters({
      filteredItems: "project/filteredItems",
      loading: "project/loading",
      currentProcess: "process/current",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
    }),
    process: {
      get() {
        return this.currentProcess("projects").process;
      },
    },
    items: {
      get() {
        if (!this.process) {
          return [];
        }

        const result = this.$store.getters["project/filteredByprocess"](
          this.process.id
        );
        return result;
      },
    },
  },
  async mounted() {
    if (this.process) {
      await this.$store.dispatch("process/findById", {
        id: this.process.id,
        force: true,
      });
      await this.$store.dispatch("project/findByProcess", {
        id: this.process.id,
        force: true,
      });
    }
  },
  methods: {
    overlayClick() {
      if (this.currentItem) {
        this.toggleItem(null);
      } else {
        this.showDetails(null);
      }
    },
    getProjectFromStage(stage) {
      const it = this.$store.getters["project/filteredByprocess"](
        this.process.id
      )
        .filter(
          (o) =>
            o.getStage(stage.id) && o.getStage(stage.id).status != "NOT_STARTED"
        )
        .sort((a, b) => {
          const stageA = a.getStage(stage.id);
          const stageB = b.getStage(stage.id);
				console.log(stageA);
				console.log(stageB);
          if (stageA.status != stageB.status) {
            return stageA.status === "STARTED" ? -1 : 1;
          }
          return a.name < b.name ? -1 : 1;
        });
			console.log(it);
      return it;
    },
    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    async saveItem(form) {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$store.dispatch("toolCategory/update", form);
        this.toggleItem(null);
      }
    },

    async loadItem(item) {
      try {
        if (!item.products) {
          this.loadingItem = true;
        }
        this.currentRowDetails.item = await this.$store.dispatch(
          "toolCategory/findById",
          {
            id: item.id,
          }
        );
      } finally {
        this.loadingItem = false;
      }
    },
    async showDetails(row) {
      if (this.currentRowDetails) {
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
      this.$validator.pause();
      this.$validator.reset();
      if (!item || (this.currentItem && this.currentItem.id === item.id)) {
        this.currentItem = null;
        this.updateForm = null;
        this.deleting = false;
      } else {
        this.updateForm = new GQLForm({
          id: item.id,
          name: item.name,
        });
        this.currentItem = item;
        this.$validator.reset();
        this.$validator.resume();
      }
      this.$store.dispatch("app/toggleInnerOverlay");
    },
    async onToolSelected(item) {
      this.updateForm.toolId = item.id;
      this.updateForm.name = item.name;
    },
    async onToolInputChange(query) {
      this.updateForm.toolId = null;

      if (query.trim().length <= 3) {
        return [];
      }
      const response = await this.$store.dispatch("tool/findAll", {
        where: {
          field: "name",
          op: "like",
          value: query,
        },
      });

      return response;
    },
    constructRefForItem(project, stage) {
      return `project_stage_${project.id}_${stage.id}`;
    },
    itemToggled(item, stage) {
      if (this.currentItem && stage.id === this.currentItem.id) {
        this.currentItem = null;
      } else {
        this.currentItem = stage;
      }
    },
    itemDetailsToggled(expanded, item, stage) {
      if (expanded) {
        const ref = this.$refs[`stage_${stage.stageId}`];
        if (ref) {
          this.$nextTick(() => scrollLeftToElement(ref[0]));
        }
      }
    },
    itemChanged(item) {
      if (item) {
        this.loadItem(item);
      }
    },
  },
};
</script>
