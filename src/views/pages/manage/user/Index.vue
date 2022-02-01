<template>
  <div class="page animated fadeIn">
    <div
      v-if="currentItem || currentRowDetails || resetingPassword"
      class="overlay"
      :class="{ 'top-all': this.showInnerOverlayOnTop || resetingPassword }"
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
          :tbody-tr-class="
            (item, type) => (isRowEditing(item) ? 'editing' : null)
          "
        >
          <template v-slot:table-colgroup="scope">
            <col style="width: 30%" />
            <col style="width: 15%" />
            <col style="width: 10%" />
            <col style="width: 10%" />
            <col style="width: 10%" />
            <col style="width: 5%" />
            <col style="width: 250px" />
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
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
            >
              <span>
                <img
                  :src="row.item.getAvatarUrl('50x50')"
                  class="border rounded-circle"
                  height="25px"
                />
                {{ row.item.firstName }} {{ row.item.lastName }}
              </span>
              <template v-if="isRowEditing(row)" slot="editing">
                <div class="d-flex">
                  <div class="flex-grow-1 mr-1" style="position: relative">
                    <b-input
                      v-model="updateForm.firstName"
                      v-validate="'required|min:2'"
                      name="firstName"
                      size="sm"
                      :state="$validateState('firstName', updateForm)"
                      :disabled="updateForm.busy"
                    ></b-input>
                    <b-form-invalid-feedback>{{
                      $displayError("firstName", updateForm)
                    }}</b-form-invalid-feedback>
                  </div>
                  <div class="flex-grow-1" style="position: relative">
                    <b-input
                      v-model="updateForm.lastName"
                      v-validate="'required|min:2'"
                      name="lastName"
                      size="sm"
                      :state="$validateState('lastName', updateForm)"
                      :disabled="updateForm.busy"
                    ></b-input>
                    <b-form-invalid-feedback>{{
                      $displayError("lastName", updateForm)
                    }}</b-form-invalid-feedback>
                  </div>
                </div>
                <div
                  v-if="$can('auth/user/reset_password', row.item)"
                  class="edit-tools-buttons"
                >
                  <confirm-button
                    size="sm"
                    variant="link"
                    btn-class="text-undecorated text-white"
                    style="margin-left: -10px; margin-top: 10px"
                    :show-overlay="false"
                    confirm-class="btn-primary"
                    :confirm-title="
                      $t('Reset') +
                      ' ' +
                      row.item.firstName +
                      ' ' +
                      $t('password') +
                      '?'
                    "
                    :confirm-message="
                      $t('We will send a new password to') +
                      ' ' +
                      row.item.email
                    "
                    :confirm-text="$t('Reset password')"
                    @confirm="resetPassword(row.item)"
                    >{{ $t("Reset password") }}</confirm-button
                  >
                </div>
              </template>
            </table-editable-cell>
          </template>

          <!-- email -->
          <template v-slot:cell(email)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="email"
              :static-value="row.item.email"
            >
              <template v-if="isRowEditing(row)" slot="editing">
                <b-input
                  v-model="updateForm.email"
                  v-validate="'required|email'"
                  name="email"
                  type="email"
                  size="sm"
                  :state="$validateState('email', updateForm)"
                  :disabled="updateForm.busy"
                ></b-input>
                <b-form-invalid-feedback>{{
                  $displayError("email", updateForm)
                }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>

          <!--role -->
          <template v-slot:cell(role)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="roleId"
              :static-value="row.item.role ? row.item.role.name : $t('N/A')"
            >
              <template v-if="isRowEditing(row)" slot="editing">
                <b-select
                  v-model="updateForm.roleId"
                  name="roleId"
                  size="sm"
                  :state="$validateState('roleId', updateForm)"
                  :disabled="updateForm.busy"
                >
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </option>
                </b-select>
                <b-form-invalid-feedback>{{
                  $displayError("roleId", updateForm)
                }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>

          <!--companyRole -->
          <template v-slot:cell(companyRole)="row">
            <table-editable-cell
              :row="row"
              :editing="isRowEditing(row)"
              :item="updateForm"
              property="companyRoleId"
              :static-value="
                row.item.companyRole ? row.item.companyRole.name : $t('N/A')
              "
            >
              <template v-if="isRowEditing(row)" slot="editing">
                <b-select
                  v-model="updateForm.companyRoleId"
                  name="companyRoleId"
                  size="sm"
                  :state="$validateState('companyRoleId', updateForm)"
                  :disabled="updateForm.busy"
                >
                  <option
                    v-for="role in companyRoles"
                    :key="role.id"
                    :value="role.id"
                  >
                    {{ role.name }}
                  </option>
                </b-select>
                <b-form-invalid-feedback>{{
                  $displayError("companyRoleId", updateForm)
                }}</b-form-invalid-feedback>
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
              :static-value="$currency(row.item.yearlyCosts)"
            >
              <template v-if="isRowEditing(row)" slot="editing">

                <b-input
                  v-model.number="updateForm.yearlyCosts"
                  v-validate="'required|numeric|min_value:1|max_value:2147483647'"
                  name="yearlyCosts"
                  type="number"
                  size="sm"
                  :state="$validateState('yearlyCosts', updateForm)"
                  :disabled="updateForm.busy"
                ></b-input>
                <b-form-invalid-feedback>{{
                  $displayError("yearlyCosts", updateForm)
                }}</b-form-invalid-feedback>
              </template>
            </table-editable-cell>
          </template>

          <!-- actions -->
          <template v-slot:cell(actions)="row" class="actions">
            <!-- when the row is editing -->
            <div v-if="isRowEditing(row)" class="text-right">
              <table-edit-tools-buttons
                :item="row.item"
                :show-save-button="$can('auth/user/update', row.item)"
                :disable-save-button="vErrors.any() || updateForm.busy"
                :show-delete-button="$can('auth/user/delete', row.item)"
                :loading="updateForm.busy"
                store="user"
                @cancel="toggleItem(row.item)"
                @delete="toggleItem(null)"
                @save="saveItem(updateForm)"
              ></table-edit-tools-buttons>
            </div>
            <!-- when the row is not editing -->
            <table-tools-buttons
              v-else
              :item="row.item"
              :show-edit-button="$can('auth/user/update', row.item)"
              :show-delete-button="$can('auth/user/delete', row.item)"
              store="user"
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
        busy: false,
      },
    };
  },
  computed: {
    ...mapGetters({
      items: "user/filteredItems",
      showInnerOverlayOnTop: "app/show_inner_overlay_on_top",
      companyRoles: "companyRole/all",
      roles: "role/all",
    }),
    fields: {
      get() {
        return [
          { key: "fullName", label: this.$t("Name"), sortable: true },
          { key: "email", label: this.$t("Email"), sortable: true },
          { key: "companyRole", label: this.$t("Role"), sortable: true },
          {
            key: "yearlyCosts",
            label: this.$t("Yearly Costs"),
            sortable: true,
          },
          { key: "role", label: this.$t("Permissions"), sortable: true },
          { key: "lang", label: this.$t("Lang"), sortable: true },
					{ key: "actions", label: this.$t("Manage"), class: "actions" },
        ];
      },
    },
  },
  async mounted() {
    this.$store.dispatch("user/findAll", {
      force: true,
      filter: this.filter,
    });
    this.$store.dispatch("companyRole/findAll");
    this.$store.dispatch("role/findAll");
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
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          roleId: item.role ? item.role.id : null,
          companyRoleId: item.companyRole ? item.companyRole.id : null,
          yearlyCosts: item.yearlyCosts,
        });
        this.currentItem = item;
        this.$validator.reset();
        this.$validator.resume();
      }
      this.$store.dispatch("app/toggleInnerOverlay");
    },
    async saveItem(form) {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        //form.yearlyCosts *= 100;
        await this.$store.dispatch("user/update", form);
        this.toggleItem(null);
      }
    },
    cancelResetPassword() {
      this.resetingPassword = null;
      if (!this.currentItem) {
        this.$store.dispatch("app/toggleInnerOverlay");
      }
    },
    async resetPassword(item) {
      try {
        await this.$store.dispatch(
          "user/resetPassword",
          new GQLForm({ id: item.id }, null)
        );
      } finally {
        this.cancelResetPassword();
      }
    },
  },
};
</script>
