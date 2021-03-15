<template>
  <b-form
    class="hide-labels"
    @submit.prevent="save"
    @keyup="$validator.validateAll()"
  >
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="firstName"
            v-model="form.firstName"
            v-validate="'required'"
            :disabled="form.busy"
            :placeholder="$t('First name')"
            type="text"
            name="firstName"
            :state="$validateState('firstName', form)"
            autofocus
          ></b-form-input>
          <label for="firstName">{{ $t("First name") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("firstName", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="lastName"
            v-model="form.lastName"
            v-validate="'required'"
            :disabled="form.busy"
            :placeholder="$t('Last name')"
            type="text"
            name="lastName"
            :state="$validateState('lastName', form)"
          ></b-form-input>
          <label for="lastName">{{ $t("Last name") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("lastName", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="email"
            v-model="form.email"
            v-validate="'required|email'"
            :disabled="form.busy"
            :placeholder="$t('Email')"
            type="email"
            name="email"
            :state="$validateState('email', form)"
          ></b-form-input>
          <label for="email">{{ $t("Email") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("email", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="yearlyCosts"
            v-model.number="form.yearlyCosts"
            v-validate="'required|numeric|min_value:1|max_value:2147483647'"
            step="1"
            min="0"
            :disabled="form.busy"
            :placeholder="$t('Yearly Costs')"
            type="number"
            name="yearlyCosts"
            :state="$validateState('yearlyCosts', form)"
          ></b-form-input>
          <label for="yearlyCosts">{{
            $t("Yearly Costs") +
            (currentUser && currentUser.company
              ? " (" + currentUser.company.currencyCode + ")"
              : "")
          }}</label>
          <b-form-invalid-feedback>{{
            $displayError("yearlyCosts", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            v-model="form.companyRoleId"
            v-validate="'required'"
            label="name"
            data-vv-name="companyRole"
            :placeholder="$t('Role')"
            :reduce="(role) => role.id"
            :options="companyRoles"
            :class="{
              'is-invalid': $validateState('companyRole', form) === false,
              'is-valid': $validateState('companyRole', form) === true,
            }"
          ></v-select>
          <label for="companyRole">{{ $t("Role") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("companyRole", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            v-model="form.roleId"
            v-validate="'required'"
            label="name"
            data-vv-name="role"
            :placeholder="$t('Permissions')"
            :reduce="(role) => role.id"
            :options="getAssignableRoles"
            :disabled="form.busy"
            :class="{
              'is-invalid': $validateState('role', form) === false,
              'is-valid': $validateState('role', form) === true,
            }"
          ></v-select>
          <label for="role">{{ $t("Permissions") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("role", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            v-model="form.lang"
            v-validate="'required'"
            label="text"
            data-vv-name="value"
            :placeholder="$t('Language')"
            :options="getAssignableLanguages"
						:reduce="(lang) => lang.value"
            :disabled="form.busy"
            :class="{
              'is-invalid': $validateState('lang', form) === false,
              'is-valid': $validateState('lang', form) === true,
            }"
          ></v-select>
          <label for="lang">{{ $t("Language") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("lang", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <hr />
        <loading-button
          block
          size="lg"
          type="submit"
          :disabled="vErrors.any() || form.busy"
          :loading="form.busy"
          variant="primary"
          >{{ $t("Save changes") }}</loading-button
        >
        <div v-if="mode === 'edit'" class="mt-3 text-center">
          <hr />
          <b-button
            variant="link"
            type="button"
            class="text-danger"
            block
            @click.prevent="resetPassword"
            >{{ $t("Reset password") }}</b-button
          >
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";
import { User } from "@/models";
import { getSupportedLocales } from "@/lib/utils";

export default {
  props: {
    value: {
      type: Object,
      required: false,
      default: () => new User(),
    },
    mode: {
      type: String,
      required: false,
      default: "create",
    },
  },
  data: () => ({
    input: null,
    form: new GQLForm({
      id: null,
      firstName: null,
      lastName: null,
      email: null,
      phone: null,
      avatar: null,
      roleId: null,
      companyRoleId: null,
      yearlyCosts: null,
      lang: null,
    }),
  }),
  computed: {
    ...mapGetters({
      roles: "role/all",
      companyRoles: "companyRole/all",
      currentUser: "auth/user",
    }),
    getAssignableLanguages() {
      const items = [];
      const annotedLabels = getSupportedLocales();
      annotedLabels.forEach((element) => {
        items.push({
          text: element.name,
          value: element.code,
        });
      });
			console.log(items);
      return items;
    },
    getAssignableRoles() {
      let assignableRoles = [];

      switch (this.currentUser.roles[0].name) {
        case "Company Admin":
          assignableRoles = this.roles;
          break;
        case "Company Manager":
          assignableRoles = this.roles.filter(
            (role) => role.name !== "Company Admin"
          );
          break;
        default:
          assignableRoles = this.roles.filter(
            (role) =>
              role.name !== "Company Admin" && role.name !== "Company Manager"
          );
      }

			console.log(assignableRoles);

      return assignableRoles;
    },
  },

  async mounted() {
    this.input = this.value;
    await this.initForm();
    await this.$store.dispatch("companyRole/findAll");
    await this.$store.dispatch("role/findAll");
  },
  methods: {
    async initForm() {
      Object.keys(this.input)
        .filter((key) => key in this.form)
        .forEach((key) => (this.form[key] = this.input[key]));
      this.form.roleId = this.input.role ? this.input.role.id : null;
      this.form.companyRoleId = this.input.companyRole
        ? this.input.companyRole.id
        : null;
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();
          console.log(this.form);

          if (this.mode === "edit") {
            this.input = await this.$store.dispatch("user/update", this.form);
          } else {
            this.input = await this.$store.dispatch("user/create", this.form);
          }
          await this.initForm();
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {
        console.error(ex.message);
      }
    },

    async resetPassword() {
      await this.$swal({
        title: this.$t("Are you sure?"),
        text: this.$t("We'll set and send a new password for the user"),
        type: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("Yes, reset!"),
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            return await this.$store.dispatch(
              "user/resetPassword",
              new GQLForm(
                {
                  id: this.input.id,
                },
                null
              )
            );
          } finally {
            this.$swal.close();
          }
        },
      });
    },
  },
};
</script>
