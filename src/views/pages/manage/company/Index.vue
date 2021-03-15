<template>
  <div class="page animated fadeIn">
    <div
      v-if="currentItem || currentRowDetails || resetingPassword"
      class="overlay"
      :class="{'top-all':this.showInnerOverlayOnTop || resetingPassword}"
      @click="overlayClick"
    ></div>
    <div class="container-fluid">
      <!-- page content -->
      <b-card>
        <b-table
          sort-icon-left
          sort-by="fullName"
          :busy="filter.busy"
          class="t01"
          primary-key="id"
          hover
          :fields="fields"
          :items="items"
          :show-empty="true"
          :empty-text="$t('There are no records for the given criteria')"
          :tbody-tr-class="(item,type)=>isRowEditing(item)?'editing':null"
        >
          <template v-slot:table-colgroup="scope">
            <col style="width:30%" />
            <col style="width:15%" />
            <col style="width:10%" />
            <col style="width:10%" />
            <col style="width:10%" />
            <col style="width:5%" />
            <col style="width:250px" />
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
            <table-editable-cell :row="row" :editing="isRowEditing(row)" :item="updateForm">
              <span>
                <img
                  :src="row.item.logoUrl"
                  class="border rounded-circle"
                  height="30px"
                />
                {{ row.item.name }}
              </span>
              <template v-if="isRowEditing(row)" slot="editing">
                <div class="d-flex">
                  <div class="flex-grow-1 mr-1" style="position:relative">
                    <b-input
                      v-model="updateForm.name"
                      v-validate="'required|min:4'"
                      name="name"
                      size="sm"
                      :state="$validateState('name', updateForm)"
                      :disabled="updateForm.busy"
                    ></b-input>
                    <b-form-invalid-feedback>{{ $displayError('name', updateForm) }}</b-form-invalid-feedback>
                  </div>

                </div>

              </template>
            </table-editable-cell>
          </template>

          <!-- Currency Code -->
          <template v-slot:cell(currencyCode)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="currencyCode"
              :static-value="row.item.currencyCode"
            >
              <template v-if="isRowEditing(row)" slot="editing">
                  <b-form-select
                  id="currencyCode"
                  v-model="updateForm.currencyCode"
                  v-validate="'required'"
                  :disabled="updateForm.busy"
                  :placeholder="$t('Currency')"
                  type="text"
                  name="currencyCode"
                  :state="$validateState('currencyCode', updateForm)"
                >
                  <option :value="null">--- {{ $t('None')}} ---</option>
                  <option
                    v-for="(item, index) in currencies"
                    :key="index"
                    :value="item.code"
                  >{{ item.name }} | {{ item.symbol }} ({{ item.code }})</option>
                </b-form-select>

                <b-form-invalid-feedback>{{ $displayError('currencyCode', updateForm) }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>


          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <!-- when the row is editing -->
            <div v-if="isRowEditing(row)" class="text-right">
              <table-edit-tools-buttons
                :item="row.item"
                :show-save-button="$can('core/company/update', row.item)"
                :disable-save-button="vErrors.any()||updateForm.busy"
                :show-delete-button="$can('core/company/delete', row.item)"
                :loading="updateForm.busy"
                store="company"
                @cancel="toggleItem(row.item)"
                @delete="toggleItem(null)"
                @save="saveItem(updateForm)"
              ></table-edit-tools-buttons>
            </div>
            <!-- when the row is not editing -->
            <table-tools-buttons
              v-else
              :item="row.item"
              :show-edit-button="$can('core/company/update', row.item)"
              :show-delete-button="$can('core/company/delete', row.item)"
              store="company"
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
import GQLForm from "@/lib/gqlform";

export default {
  components: {},
  data: () => {
    return {
      currentItem: null,
      currentRowDetails: null,
      resetingPassword: false,
      updateForm: null,
      filter: {
        busy: false
      }
    };
  },
  computed: {
    ...mapGetters({
      items: "company/filteredItems",
      currencies: "currency/all",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
    }),
    fields: {
      get() {
        return [
          { key: "name", label: this.$t("name"), sortable: true },
          { key: "currencyCode", label: this.$t("Currency"), sortable: true },
          { key: "actions", label: this.$t("Manage"), class: "actions" }
        ];
      }
    }
  },
  async mounted() {
    this.$store.dispatch("company/findAll", {
      force: true,
      filter: this.filter
    });
  },
  methods: {
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
      }
    },
    toggleItem(item) {
      this.$validator.pause();
      this.$validator.reset();
      if (!item || (this.currentItem && this.currentItem.id === item.id)) {
        this.currentItem = null;
        this.updateForm = null;
      } else {
        this.updateForm = new GQLForm({
          id: item.id,
          name: item.name,
          currencyCode: item.currencyCode,
          // roleId: item.role ? item.role.id : null,
          // companyRoleId: item.companyRole ? item.companyRole.id : null,
          // yearlyCosts: item.formattedYearlyCosts,
          // avatar: item.avatar
        });
        this.currentItem = item;
        this.$validator.reset();
        this.$validator.resume();
      }
      this.$store.dispatch("app/toggleInnerOverlay");
    },
    async saveItem(form) {
			console.log(form);
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        form.yearlyCosts *= 100;
        await this.$store.dispatch("company/update", form);
        this.toggleItem(null);
      }
    },


  }
};
</script>
