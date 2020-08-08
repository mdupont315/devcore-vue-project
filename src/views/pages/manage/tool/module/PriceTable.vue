<template>
  <div>
    <div class="table-responsive" style="overflow:visible">
      <b-table
        sort-icon-left
        sort-by="name"
        class="t02"
        primary-key="id"
        hover
        :fields="fields"
        :items="toolModule.prices"
        :show-empty="true"
        :empty-text="$t('There are no records for the given criteria')"
        :tbody-tr-class="(item,type)=>isRowEditing(item)?'editing':null"
      >
        <template v-slot:table-colgroup>
          <col style="width:35%" />
          <col style="width:20%" />
          <col style="width:10%" />
          <col style="width:10%" />
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

        <template v-slot:head(actions)>
          <div class="text-right" style="position:relative">
            <b-button
              @click="togglePopOver"
              ref="btnNewProduct"
              variant="primary btn-action"
              size="xs"
              class="px-3"
              style="position:absolute;top:-14px;right:0"
              v-show="!currentItem && $can('core/companyTool/create')"
            >+ {{ $t('New') }}</b-button>
          </div>
          <b-popover
            :target="()=>$refs.btnNewProduct"
            :show.sync="showPopOver"
            class="form-popover"
            ref="popover"
            placement="bottom"
            boundary="viewport"
          >
            <b-card no-body style="max-width:300px">
              <b-card-body>
                <price-form
                  v-if="newItem"
                  :companyTool="toolModule"
                  @done="formDone"
                  v-model="newItem"
                ></price-form>
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
            :staticValue="row.item.priceModel!='PROJECT'?row.item.name:row.item.parent.name"
          >
            <template slot="editing" v-if="isRowEditing(row)">
              <div v-if="updateForm.priceModel!='PROJECT'">
                <b-form-input
                  id="name"
                  :disabled="updateForm.busy"
                  v-model="updateForm.name"
                  :placeholder="$t('Price name')"
                  type="text"
                  name="name"
                  :state="$validateState('name', updateForm)"
                  v-validate="'required|min:4'"
                ></b-form-input>
                <b-form-invalid-feedback>{{ $displayError('name', updateForm) }}</b-form-invalid-feedback>
              </div>
              <div v-else>
                <b-select
                  v-model="updateForm.parentId"
                  name="parentId"
                  size="sm"
                  :state="$validateState('parentId', updateForm)"
                  :disabled="updateForm.busy"
                >
                  <option
                    v-for="project in projects"
                    :key="project.id"
                    :value="project.id"
                  >{{ project.name }}</option>
                </b-select>
                <b-form-invalid-feedback>{{ $displayError('parentId', updateForm) }}</b-form-invalid-feedback>
              </div>
            </template>
          </table-editable-cell>
        </template>

        <!-- price model -->
        <template v-slot:cell(priceModel)="row">
          <table-editable-cell
            :row="row"
            :editing="isRowEditing(row)"
            :item="updateForm"
            property="priceModel"
            :staticValue="$t('priceModel.'+row.item.priceModel)"
          >
            <template slot="editing" v-if="isRowEditing(row)">
              <b-select
                v-model="updateForm.priceModel"
                name="priceModel"
                size="sm"
                :state="$validateState('priceModel', updateForm)"
                :disabled="updateForm.busy"
              >
                <option
                  v-for="model in priceModels"
                  :key="model.id"
                  :value="model.name"
                >{{ $t('priceModel.' + model.id) }}</option>
              </b-select>
              <b-form-invalid-feedback>{{ $displayError('priceModel', updateForm) }}</b-form-invalid-feedback>
            </template>
          </table-editable-cell>
        </template>

        <!-- yearlyCosts -->
        <template v-slot:cell(yearlyCosts)="row">
          <table-editable-cell
            :row="row"
            :editing="isRowEditing(row)"
            :item="updateForm"
            property="yearlyCosts"
            :staticValue="$currency(row.item.yearlyCosts/100)"
          >
            <template slot="editing" v-if="isRowEditing(row)">
              <b-input
                name="price"
                type="number"
                size="sm"
                v-model.number="price"
                :disabled="updateForm.busy"
                v-validate="'required|numeric|min:0'"
                @change="changePrice"
                :state="$validateState('price', updateForm)"
              ></b-input>
              <b-form-invalid-feedback>{{ $displayError('price', updateForm) }}</b-form-invalid-feedback>
            </template>
          </table-editable-cell>
        </template>

        <!-- expiration -->
        <template v-slot:cell(expiration)="row">
          <table-editable-cell
            :row="row"
            :editing="isRowEditing(row)"
            :item="updateForm"
            property="yearlyCosts"
            :staticValue="formatDate(row.item.expiration)"
          >
            <template slot="editing" v-if="isRowEditing(row)">
              <b-input
                name="expiration"
                type="date"
                v-if="updateForm.priceModel==='LICENSE'"
                size="sm"
                v-model="updateForm.expiration"
                :disabled="updateForm.busy"
                v-validate="'required'"
                @change="changePrice"
                :state="$validateState('expiration', updateForm)"
              ></b-input>
              <b-form-invalid-feedback>{{ $displayError('expiration', updateForm) }}</b-form-invalid-feedback>
            </template>
          </table-editable-cell>
        </template>

        <!-- actions -->
        <template v-slot:cell(actions)="row" class="actions">
          <!-- when the row is editing -->
          <div v-if="isRowEditing(row)" class="text-right d-flex justify-content-end">
            <table-edit-tools-buttons
              :item="row.item"
              :showSaveButton="$can('core/companyTool/update', row.item)"
              :disableSaveButton="vErrors.any()||updateForm.busy"
              :loading="updateForm.busy"
              :showDeleteButton="$can('core/companyTool/delete', row.item)"
              @cancel="toggleItem(row.item)"
              @deleted="itemDeleted"
              @save="saveItem(updateForm)"
              ref="editButtons"
              store="companyToolPrice"
              deleteConfirmBoundary="viewport"
            ></table-edit-tools-buttons>
          </div>
          <!-- when the row is not editing -->
          <div class="d-flex justify-content-end" v-else>
            <div class="float-right">
              <table-tools-buttons
                :item="row.item"
                @deleted="itemDeleted"
                :showEditButton="$can('core/companyTool/update', row.item)"
                :btnEditClass="'btn-white btn-sm border-0 text-primary'"
                :btnDeleteClass="'btn-white btn-sm border-0 text-danger'"
                :showDeleteButton="$can('core/companyTool/delete', row.item)"
                store="companyToolPrice"
                @editItem="toggleItem(row.item)"
              ></table-tools-buttons>
            </div>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>
<script>
import { CompanyToolPrice } from "@/models";
import GQLForm from "@/lib/gqlform";
import PriceForm from "./PriceForm";
import { mapGetters } from "vuex";
import moment from "moment";
export default {
  props: {
    toolModule: {
      type: Object,
      required: true
    }
  },
  components: {
    "price-form": PriceForm
  },
  data: () => {
    return {
      price: null,
      form: null,
      currentItem: null,
      showPopOver: false,
      newItem: null,
      updateForm: null,
      currentRowDetails: null,
      currentDetailsItem: null,
      deleting: false
    };
  },
  computed: {
    ...mapGetters({
      priceModels: "priceModel/all",
      projects: "project/all"
    }),
    fields: {
      get: function() {
        return [
          { key: "name", label: this.$t("Name"), sortable: true },
          { key: "priceModel", label: this.$t("Price model"), sortable: true },
          {
            key: "yearlyCosts",
            label: this.$t("Yearly costs"),
            sortable: true
          },
          { key: "expiration", label: this.$t("Expiration"), sortable: true },

          { key: "actions", label: "" }
        ];
      }
    }
  },
  async mounted() {
    await this.$store.dispatch("project/findAll");
  },
  methods: {
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
        onClick: this.togglePopOver
      });

      if (this.showPopOver) {
        this.newItem = new CompanyToolPrice().deserialize({
          companyToolId: this.toolModule.id
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
    formatDate(value) {
      return value ? moment(value).format("YYYY-MM-DD") : "N/A";
    },
    changePrice(value) {
      this.updateForm.price = value * 100;
    },
    async toggleItem(item) {
      this.deleting = false;
      this.$validator.pause();
      this.$validator.reset();
     
      console.log("Check Toggle Items")
      console.log((this.currentItem && this.currentItem.id === item.id))
      console.log(item)

      if (item == null || (this.currentItem && this.currentItem.id === item.id)) {
        this.currentItem = null;
        this.updateForm = null;
      } else {
        this.currentItem = item ? item : null;
        this.updateForm = new GQLForm({
          id: item.id,
          companyToolId: this.toolModule.id,
          priceModel: item.priceModel,
          name: item.name,
          parentType: item.parentType,
          parentId: item.parentId,
          expiration: (item.expiration != null) ? moment(item.expiration).format("YYYY-MM-DD") : null,
          price: item.price / 100
        });

        this.price = this.updateForm.price;
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
        await this.$store.dispatch("companyToolPrice/update", form);
        this.$emit("itemChanged");
      }
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
      this.updateForm.toolModule = item.id;
      this.updateForm.name = item.name;
    },
    async onToolModuleInputChange(query) {
      this.updateForm.toolModule = null;

      if (query.trim().length <= 3) {
        return [];
      }

      const response = await this.$store.dispatch("toolModule/findAll", {
        conditions: {
          and: [
            { field: "tool", op: "eq", value: this.companyTool.toolId },
            { field: "name", op: "contains", value: query }
          ]
        }
      });

      return response;
    }
  }
};
</script>