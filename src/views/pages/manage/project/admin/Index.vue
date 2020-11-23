<template>
  <div class="page animated fadeIn">
    <div class="container-fluid">
      <!-- page content -->
      <b-card>
        <b-table
          sort-icon-left
          sort-by="name"
          class="t01"
          primary-key="id"
          hover
          :fields="fields"
          :items="items"
          :busy="loadingForm.busy"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
        >
          <template v-slot:table-colgroup>
            <col style />
            <col style="width:20%" />
            <col style="width:20%" />
            <col style="width:300px" />
          </template>
          <template v-slot:empty="scope">
            <p class="alert alert-warning text-center">{{ scope.emptyText }}</p>
          </template>
          <template v-slot:table-busy>
            <div class="text-center text-primary my-2">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <template v-slot:cell(title)="row">{{row.item.title}}</template>
          <template v-slot:cell(status)="row">
            <span
              class="project-status"
              :class="'project-status-'+row.item.status.replace(' ', '_').toLowerCase()"
            >{{ row.item.status }}</span>
          </template>
          <template v-slot:cell(stage)="row">
            <span
              class="text-capitalize text-overflow"
            >{{row.item.currentStage?row.item.currentStage.title:"N/A"}}</span>
          </template>

          <template v-slot:cell(actions)="row">
            <table-tools-buttons
              :item="row.item"
              :show-edit-button="$can('core/project/update', row.item)"
              :show-delete-button="$can('core/project/delete', row.item)"
              store="project"
              @editItem="toggleItem(row.item)"
            ></table-tools-buttons>
          </template>
        </b-table>
      </b-card>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
// import GQLForm from "@/lib/gqlform";

export default {
  components: {},
  data: () => {
    return {
      loadingForm: {
        loading: false
      },
      detailsForm: {}
    };
  },
  computed: {
    ...mapGetters({
      loading: "project/loading",
      currentProcess: "process/current",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top"
    }),
    process: {
      get() {
        return this.currentProcess("projects").process;
      }
    },
    items: {
      get() {
        if (!this.process) {
          return [];
        }
        return this.$store.getters["project/filteredByprocess"](
          this.process.id
        );
      }
    },
    fields: {
      get() {
        return [
          { key: "name", label: this.$t("Name"), sortable: true },
          { key: "status", label: this.$t("Status"), sortable: true },
          {
            key: "stage",
            label: this.$t("Current stage"),
            sortable: false
          },
          { key: "actions", label: this.$t("Manage"), class: "actions" }
        ];
      }
    }
  },
  async mounted() {
    if (this.process) {
      this.loadingForm = {
        id: this.process.id,
        force: true
      };
      await this.$store.dispatch("process/findById", this.loadingForm);
      this.loadingForm = {
        id: this.process.id,
        force: true
      };
      await this.$store.dispatch("project/findByProcess", this.loadingForm);
    }
  },
  methods: {
    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    initEdit(item) {
      this.editItem = {
        id: item.id,
        ideas: item.ideas.map(i => i.ideaId),
        tools: item.tools.map(i => i.id),
        users: item.users.map(i => i.id),
        name: item.name,
        budget: item.budget,
        process: item.process.id,
        stage: item.currentStage.stageId
      };
    },
    async loadDetails() {
      this.detailsForm = {
        id: this.item.id,
        busy: false
      };
      await this.$store.dispatch("project/findById", this.detailsForm);
    },
    async toggleEdit() {
      if (!this.editing) {
        await this.loadDetails();
        this.initEdit();
      }

      this.editing = !this.editing;
    },
    async toggleItem(item){
      console.log(item)
    }
  }
};
</script>