<template>
  <div>
    <div
      v-if="currentItem || currentRowDetails"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop }"
      @click="overlayClick"
    ></div>
    <div class="table-responsive" style="overflow: visible">
      <b-table
        sort-icon-left
        sort-by="name"
        :busy="busy"
        class="t02"
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
          <col style="width: 45%" />
          <col style="width: 20%" />
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

        <template v-slot:head(actions)>
          <div class="text-right" style="position: relative">
            <b-button
              ref="btnNewProduct"
              v-show="!currentItem && $can('core/companyTool/create')"
              variant="primary btn-action"
              size="xs"
              class="px-3"
              style="position: absolute; top: -14px; right: 0"
              @click="togglePopOver"
              > {{ $t("New") }}</b-button
            >
          </div>
          <b-popover
            ref="popover"
            :target="() => $refs.btnNewProduct"
            :show.sync="showPopOver"
            class="form-popover"
            placement="bottom"
            boundary="viewport"
          >
            <b-card no-body style="max-width: 300px">
              <b-card-body>
                <module-form
                  v-if="newItem"
                  v-model="newItem"
                  :company-tool="companyTool"
                  @done="formDone"
                ></module-form>
              </b-card-body>
            </b-card>
          </b-popover>
        </template>

        <!-- name -->
        <template v-slot:cell(name)="row">
          <table-editable-cell
            :row="row"
            :editing="isRowEditing(row)"
            :item="updateForm"
            property="name"
            :static-value="row.item.info.name"
          >
            <template v-if="isRowEditing(row)" slot="editing">
              <suggestions
                v-model="updateForm.name"
                class="sm"
                :v-validate="'required'"
                :options="{
                  debounce: 250,
                  inputClass: 'form-control form-control-sm',
                  autofocus: true,
                  placeholder: $t('Name'),
                }"
                :state="$validateState('toolModule', updateForm)"
                :on-input-change="onToolModuleInputChange"
                :on-item-selected="onToolModuleSelected"
                :class="{
                  'is-invalid':
                    $validateState('toolModule', updateForm) === false,
                  'is-valid': $validateState('toolModule', updateForm) === true,
                }"
              >
                <div slot="item" slot-scope="props" class="single-item">
                  <span class="name">{{ props.item.name }}</span>
                </div>
              </suggestions>
              <b-form-invalid-feedback>{{
                $displayError("toolModule", updateForm)
              }}</b-form-invalid-feedback>
            </template>
          </table-editable-cell>
        </template>

        <!-- price model -->
        <template v-slot:cell(status)="row">
          <b-button-group>
            <b-button
              variant="outline-danger"
              class="outline-none"
              :class="{ active: row.item.info.status === 'INACTIVE' }"
              @click="changeStatus(row.item.info, 'INACTIVE')"
              >{{ $t("INACTIVE") }}</b-button
            >
            <b-button
              variant="outline-primary"
              class="outline-none"
              :class="{ active: row.item.info.status === 'ACTIVE' }"
              @click="changeStatus(row.item.info, 'ACTIVE')"
              >{{ $t("ACTIVE") }}</b-button
            >
          </b-button-group>
        </template>

        <!-- yearlyCosts -->
        <template v-slot:cell(yearlyCosts)="row">{{
          $currency(calculateModulesTotal(row.item))
        }}</template>

        <!-- actions -->
        <template v-slot:cell(actions)="row" class="actions">
          <!-- when the row is editing -->
          <div
            v-if="isRowEditing(row)"
            class="text-right d-flex justify-content-end"
          >
            <table-edit-tools-buttons
              ref="editButtons"
              :item="row.item"
              :show-save-button="$can('core/companyTool/update', row.item)"
              :disable-save-button="vErrors.any() || updateForm.busy"
              :loading="updateForm.busy"
              :show-delete-button="$can('core/companyTool/delete', row.item)"
              store="companyTool"
              delete-confirm-boundary="viewport"
              @cancel="toggleItem(row.item.info)"
              @delete="itemDeleted"
              @save="saveItem(updateForm)"
            ></table-edit-tools-buttons>
          </div>
          <!-- when the row is not editing -->
          <div v-else class="d-flex">
            <div class="flex-grow-1 mr-2" style="width: 50%">
              <table-tools-buttons
                v-if="
                  !currentRowDetails ||
                  currentRowDetails.item.id !== row.item.id
                "
                :item="row.item"
                :show-edit-button="$can('core/companyTool/update', row.item)"
                :btn-edit-class="'btn-white btn-sm border-0 text-primary'"
                :show-delete-button="false"
                store="companyTool"
                @editItem="toggleItem(row.item.info)"
                @delete="itemDeleted"
              ></table-tools-buttons>
            </div>
            <div class="flex-grow-1" style="width: 50%">
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
                  currentRowDetails && currentRowDetails.item.id === row.item.id
                    ? $t("Close")
                    : $t("Prices")
                }}</b-button
              >
            </div>
          </div>
        </template>

        <!-- details -->
        <template v-slot:row-details="row">
          <div class="row-details">
            <price-table
              :tool-module="row.item.info"
              @itemChanged="priceChanged"
            ></price-table>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import Form from "./Form";
import PriceTable from "./PriceTable";
import { CompanyToolModule } from "@/models";
import GQLForm from "@/lib/gqlform";

export default {
  name: "ToolsTable",
  components: {
    "module-form": Form,
    "price-table": PriceTable,
  },
  props: {
    // categoryId: {
    //   type: String,
    //   required: true
    // },
    companyTool: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    busy: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  data: () => {
    return {
      showInnerOverlayOnTop: false,
      currentItem: null,
      showPopOver: false,
      newItem: null,
      updateForm: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      deleting: false,
    };
  },
  computed: {
    ...mapGetters({
      priceModels: "priceModel/all",
    }),
    tableItems: {
      get() {
        const items = [];

        this.items.forEach((item) => {
          let showDetails = false;
          if (
            this.currentRowDetails &&
            this.currentRowDetails.item.id === item.id
          ) {
            showDetails = true;
          }
          items.push({ info: item, id: item.id, _showDetails: showDetails });
        });
        return items;
      },
    },
    fields: {
      get() {
        return [
          { key: "name", label: this.$t("Module"), sortable: true },
          // { key: "priceModel", label: this.$t("Price model"), sortable: true },
          {
            key: "yearlyCosts",
            label: this.$t("Yearly costs"),
            sortable: true,
          },
          { key: "status", label: this.$t("Status"), sortable: false },
          { key: "actions", label: "" },
        ];
      },
    },
  },
  methods: {
    calculateModulesTotal(item) {
      if (item.info.prices && item.info.prices.length > 0) {
        let sum = 0;

        item.info.prices.map((priceObj) => {
          sum += priceObj.price / 100;
        });

        return sum;
      }
      return 0;
    },
    isRowEditing(row) {
      return (
        row &&
        this.currentItem &&
        this.currentItem.id === (row.item ? row.item.id : row.id)
      );
    },
    togglePopOver() {

      this.showPopOver = !this.showPopOver;
      this.$store.dispatch("app/showOverlay", {
        show: this.showPopOver,
        onClick: this.togglePopOver,
      });

      if (this.showPopOver) {
        this.newItem = new CompanyToolModule().deserialize({
          companyTool: this.companyTool.id,
        });
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
        this.currentRowDetails.item._showDetails = true;
      } else {
        this.currentRowDetails = null;
      }
    },
    async toggleItem(item) {
      this.deleting = false;
      this.$validator.pause();
      this.$validator.reset();
      if (!item || (this.currentItem && this.currentItem.id === item.id)) {
        this.currentItem = null;
        this.updateForm = null;
      } else {
        this.currentItem = item || null;
        this.updateForm = new GQLForm({
          id: item.id,
          name: item.name,
          companyToolId: item.companyToolId,
          toolId: null,
        });
        this.$nextTick(() => {
          this.$validator.reset();
          this.$validator.resume();
        });
      }
    },
    async saveItem(form) {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("companyTool/update", form);
        this.toggleItem(null);

        this.$emit("itemChanged");
      }
    },
    async changeStatus(item, status) {
      if (status != item.status) {
        item.status = status;
        await this.$store.dispatch(
          "companyTool/changeStatus",
          new GQLForm({
            id: item.id,
            status,
          })
        );
      }
    },
    overlayClick() {
      this.toggleItem(null);
      this.showDetails();
    },
    async formDone() {
      this.newItem = null;
      this.togglePopOver();
      this.$emit("itemChanged");
    },
    async itemDeleted() {
      this.toggleItem(null);
      this.deleting = false;
      this.$emit("itemChanged");
    },
    cancelDelete() {
      this.deleting = false;
    },

    async onToolModuleSelected(item) {
      this.updateForm.toolId = item.id;
      this.updateForm.name = item.name;
    },
    async onToolModuleInputChange(query) {
      this.updateForm.toolId = null;

      if (query.trim().length < 2) {
        return [];
      }

      const response = await this.$store.dispatch("tool/findAll", {
        where: {
          and: [
            { field: "tool_id", op: "eq", value: this.companyTool.toolId },
            { field: "name", op: "cn", value: query },
          ],
        },
      });

      return response;
    },
    async priceChanged() {
      this.$emit("priceChanged");
    },
  },
};
</script>
