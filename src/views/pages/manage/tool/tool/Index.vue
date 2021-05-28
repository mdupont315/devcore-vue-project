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
          primary-key="id"
          hover
          :fields="fields"
          :items="tableItems"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
          :tbody-tr-class="
            (item, type) => (isRowEditing(item) ? 'editing' : null)
          "
        >
          <template v-slot:table-colgroup>
            <col style="width: 70%" />
            <!-- <col style="width:20%" /> -->
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
          <template v-slot:cell(name)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="name"
              :static-value="row.item.name"
            >
              <template v-if="isRowEditing(row)" slot="editing">
                <suggestions
                  v-model="updateForm.name"
                  class="sm"
                  name="tool"
                  :options="{
                    debounce: 250,
                    inputClass: 'form-control form-control-sm',
                    autofocus: true,
                  }"
                  :state="$validateState('tool', updateForm)"
                  :on-input-change="onToolInputChange"
                  :on-item-selected="onToolSelected"
                >
                  <div slot="item" slot-scope="props" class="single-item">
                    <span class="name">{{ props.item.name }}</span>
                  </div>
                </suggestions>
                <b-form-invalid-feedback>{{
                  $displayError("tool", updateForm)
                }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>

          <!-- yearly costs -->
          <template v-slot:cell(yearlyCosts)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="yearlyCosts"
              :static-value="$currency(calculateModulesTotal(row.item))"
            >
              <template v-if="isRowEditing(row)" slot="editing">
                {{ $currency(calculateModulesTotal(row.item)) }}
                <b-form-invalid-feedback>{{
                  $displayError("yearlyCosts", updateForm)
                }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>

          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <div v-if="isRowEditing(row)" class="text-right">
              <table-edit-tools-buttons
                :item="row.item"
                :show-save-button="$can('core/companyTool/update', row.item)"
                :disable-save-button="vErrors.any() || updateForm.busy"
                :loading="updateForm.busy"
                :show-delete-button="$can('core/companyTool/delete', row.item)"
                store="companyTool"
                @cancel="toggleItem(row.item)"
                @delete="toggleItem(null)"
                @save="saveItem(updateForm)"
              ></table-edit-tools-buttons>
            </div>
            <div v-else class="d-flex">
              <table-tools-buttons
                style="max-width: 100px"
                class="flex-grow-1 mr-2"
                store="companyTool"
                :item="row.item"
                :show-delete-button="false"
                :show-edit-button="
                  $can('core/companyTool/update', row.item) &&
                  (!currentRowDetails ||
                    currentRowDetails.item.id != row.item.id)
                "
                @editItem="toggleItem"
              ></table-tools-buttons>
              <div class="flex-grow-1">
                <b-button
                  size="xs"
                  v-if="$can('core/companyTool/manage')"
                  variant="action"
                  style="font-size: 1.2rem; padding: 3px"
                  class="btn-primary btn-expand btn-block text-uppercase"
                  :class="{
                    expanded:
                      currentRowDetails &&
                      currentRowDetails.item.id === row.item.id,
                  }"
                  @click="showDetails(row)"
                  >{{
                    currentRowDetails &&
                    currentRowDetails.item.id === row.item.id
                      ? $t("Close")
                      : $t("Details")
                  }}</b-button
                >
              </div>
            </div>
          </template>

          <!-- details -->
          <template v-slot:row-details="row">
            <div class="row-details">
              <modules-table
                ref="modulesTable"
                :category-id="row.item.id"
                :items="row.item.modules"
                :company-tool="row.item"
                :busy="loadingItem"
                @itemChanged="itemChanged(row.item)"
                @priceChanged="itemChanged(row.item)"
              ></modules-table>
            </div>
          </template>
        </b-table>
      </b-card>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
// import Form from "./Form";
import ModulesTable from "../module/Table";
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    // "tool-form": Form,
    "modules-table": ModulesTable,
  },
  data: () => {
    return {
      deleting: false,
      updateForm: null,
      currentItem: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      loadingItem: false,
      filter: {
        busy: false,
      },
      toolOptions: null,
    };
  },
  computed: {
    ...mapGetters({
      items: "companyTool/filteredItems",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
      priceModels: "priceModel/all",
    }),

    tableItems: {
      get() {
        return this.items.filter((item) => item.type === "TOOL");
      },
    },
    fields: {
      get() {
        return [
          { key: "name", label: this.$t("Name"), sortable: true },
          // { key: "priceModel", label: this.$t("Price model"), sortable: true },
          {
            key: "yearlyCosts",
            label: this.$t("Yearly costs"),
            sortable: true,
          },
          { key: "actions", label: this.$t("Manage"), class: "actions" },
        ];
      },
    },
  },
  async created() {
    // this.$store.dispatch("priceModel/findAll");
    this.$store.dispatch("companyTool/findAll", {
      filter: this.filter,
      force: true,
    });
    // this.$store.dispatch("toolArea/findAll");
  },
  methods: {
    isRowEditing(row) {
      return (
        this.currentItem &&
        row &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    calculateModulesTotal(item) {
      if (item.modules && item.modules.length > 0) {
        let sum = 0;

        item.modules.map((moduleObj) => {
          moduleObj.prices.map((priceObj) => {
            sum += priceObj.price / 100;
          });
        });

        return sum;
      }
      return 0;
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
        if (!item.products) {
          this.loadingItem = true;
        }
        const openModule = this.currentRowDetails.item.modules.find(
          (f) => f._showDetails
        );
        if (openModule) {
          openModule._showDetails = false;
        }
           this.currentRowDetails.item = await this.$store.dispatch(
          "companyTool/findById",
          {
            id: item.id,
          }
				);

     // this.currentRowDetails.item = item;

        if (openModule) {
          const newModule = this.currentRowDetails.item.modules.find(
            (f) => f.id === openModule.id
          );
          newModule._showDetails = true;
        }
        console.log(this.$refs.modulesTable);
        if (this.$refs.modulesTable) this.$refs.modulesTable.$forceUpdate();
      } finally {
        this.loadingItem = false;
      }
    },

    async showDetails(row) {
      console.log("SHOW DETS");
      console.log(row);
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
      console.log(item);
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
          toolId: item.toolId,
        });
        this.currentItem = item;
        this.$validator.reset();
        this.$validator.resume();
      }
      this.$store.dispatch("app/toggleInnerOverlay");
    },
    async onToolSelected(item) {
      this.updateForm.tool = item.id;
      this.updateForm.name = item.name;
    },
    async onToolInputChange(query) {
      console.log(query);
      this.updateForm.tool = null;

      if (query.trim().length <= 3) {
        return [];
      }

      console.log(query);
      const response = await this.$store.dispatch("tool/findAll", {
        where: {
          field: "name",
          op: "cn",
          value: query,
        },
      });
      console.log(response);
      return response;
    },
    async itemChanged() {
      this.loadItem(this.currentRowDetails.item);

    },
  },
};
</script>
