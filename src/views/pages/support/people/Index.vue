<template>
  <div class="page animated fadeIn">
    <portal to="topbar-right">
      <div class="search-bar">
        <b-input-group style="margin-top:5px" class="search">
          <b-form-input
            v-model="currentFilter"
            class="search"
            :placeholder="$t('Search users') + ` (${items.length})`"
            @input="filterResults"
          ></b-form-input>
        </b-input-group>
      </div>
    </portal>

    <div
      v-if="currentItem || currentRowDetails"
      class="overlay"
      :class="{'top-all':this.showInnerOverlayOnTop}"
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
          primary-key="id"
          hover
          :fields="fields"
          :items="filteredItems"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
          :tbody-tr-class="getRowClass"
        >
          <template v-slot:table-colgroup>
            <col style="width:30%" />
            <col style="width:10%" />
            <col style="width:30%" />
            <col style="width:10%" />
            <col style="width:20%" />
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
          <template v-slot:cell(fullName)="row">
            <span>
              <img
                :src="row.item.user.getAvatarUrl('50x50')"
                class="border rounded-circle"
                height="25px"
              />
              {{ row.item.user.firstName }} {{row.item.user.lastName}}
            </span>
          </template>

          <!-- role -->
          <template
            v-slot:cell(companyRole)="row"
          >{{ row.item.companyRole?row.item.companyRole.name:null}}</template>

          <!-- active project -->
          <template v-slot:cell(activeProject)="row">
            <span class="text-capitalize">
              {{ row.item.activeProject? row.item.activeProject.project.name : $t('None')}}
              {{ (row.item.projects.length > 1? (' +' + (row.item.projects.length -1)):'')}}
            </span>
          </template>

          <template
            v-slot:cell(value)="row"
          >{{ calculateTotalValue(row.item) | numberFormat('0.00') }} %</template>

          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <div class="buttons">
              <b-button
                size="xs"
                variant="action"
                class="btn-primary btn-expand btn-block text-uppercase m-0"
                style="font-size:1.2rem;padding:3px"
                @click="showDetails(row)"
              >{{ $t('Details') }}</b-button>
            </div>
          </template>

          <!-- details -->
          <template v-slot:row-details="row">
            <div class="row-details">
              <item-details :item="row.item"></item-details>
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
import Details from "./Details";

export default {
  components: {
    "item-details": Details
  },
  data: () => {
    return {
      report: null,
      items: [],
      deleting: false,
      updateForm: null,
      currentItem: null,
      currentRowDetails: null,
      currentFilter: "",
      currentDetailsItem: null,
      loadingItem: false,
      showIdeaPopover: false,
      filter: {
        busy: false
      },
      toolOptions: null
    };
  },
  computed: {
    ...mapGetters({
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top"
    }),
    filteredItems: {
      get() {
        if (this.currentFilter !== "") {
          return this.items.filter(i => {
            return i.user.fullName.toLowerCase().includes(this.currentFilter.toLowerCase());
          });
        }
        return this.items;
      }
    },
    fields: {
      get() {
        return [
          { key: "fullName", label: this.$t("User"), sortable: true },
          { key: "companyRole", label: this.$t("Role"), sortable: true },
          {
            key: "activeProject",
            label: this.$t("Active project"),
            sortable: false
          },
          { key: "value", label: this.$t("Value"), sortable: true },
          { key: "actions", label: this.$t("Manage"), class: "actions" }
        ];
      }
    }
  },
  async mounted() {
    await this.loadReport();
  },
  methods: {
    calculateTotalValue(item) {
      if (!item) {
        return 0;
      }
      return (
        ((item.userAverage - item.otherAverage) / Math.abs(item.otherAverage)) *
        100
      );
    },
    getRowClass(item) {
      const value = this.calculateTotalValue(item);
      return {
        "text-success": value > 0,
        "text-warning": value == 0,
        "text-danger": value < 0
      };
    },
    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    overlayClick() {
      if (this.currentItem) {
        this.toggleItem(null);
      } else {
        this.showDetails(null);
      }
    },
    async loadReport() {
      this.report = await this.$store.dispatch(
        "report/peopleReport",
        this.filter
      );
      this.items = this.report.data;
    },
    async loadItem(item) {
      try {
        if (!item.issues) {
          this.loadingItem = true;
        }
        item.issues = await this.$store.dispatch("issue/findByStage", {
          id: item.id
        });
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
    filterResults(str) {
      this.currentFilter = str;
    },
    toggleItem(item) {
      this.showIdeaPopover = false;
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
          yearlyCosts: item.yearlyCosts,
          priceModel: item.priceModel ? item.priceModel.id : null,
          tool: item.toolId
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
    }
  }
};
</script>