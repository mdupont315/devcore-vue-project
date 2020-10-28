<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="hide-labels">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="firstName"
            :disabled="form.busy"
            v-model="form.firstName"
            :placeholder="$t('First name')"
            type="text"
            name="firstName"
            :state="$validateState('firstName', form)"
            v-validate="'required|min:4'"
            autofocus
          ></b-form-input>
          <label for="firstName">{{ $t('First name') }}</label>
          <b-form-invalid-feedback>{{ $displayError('firstName', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="lastName"
            :disabled="form.busy"
            v-model="form.lastName"
            :placeholder="$t('Last name')"
            type="text"
            name="lastName"
            :state="$validateState('lastName', form)"
            v-validate="'required|min:4'"
          ></b-form-input>
          <label for="lastName">{{ $t('Last name') }}</label>
          <b-form-invalid-feedback>{{ $displayError('lastName', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="email"
            :disabled="form.busy"
            v-model="form.email"
            :placeholder="$t('Email')"
            type="email"
            name="email"
            :state="$validateState('email', form)"
            v-validate="'required|email'"
          ></b-form-input>
          <label for="email">{{ $t('Email') }}</label>
          <b-form-invalid-feedback>{{ $displayError('email', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="yearlyCosts"
            step="1"
            min="0"
            :disabled="form.busy"
            v-model.number="form.yearlyCosts"
            :placeholder="$t('Yearly Costs')"
            type="number"
            name="yearlyCosts"
            :state="$validateState('yearlyCosts', form)"
            v-validate="'required|numeric|min:0'"
          ></b-form-input>
          <label
            for="yearlyCosts"
          >{{ $t('Yearly Costs') + ((currentUser && currentUser.company)?' (' + currentUser.company.currencyCode + ')':'')}}</label>
          <b-form-invalid-feedback>{{ $displayError('yearlyCosts', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            label="name"
            v-validate="'required'"
            data-vv-name="companyRole"
            v-model="form.companyRoleId"
            :placeholder="$t('Role')"
            :reduce="role => role.id"
            :options="companyRoles"
            :class="{'is-invalid':$validateState('companyRole', form)===false, 'is-valid':$validateState('companyRole', form)===true}"
          ></v-select>
          <label for="companyRole">{{ $t('Role') }}</label>
          <b-form-invalid-feedback>{{ $displayError('companyRole', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <b-col class="col-12">
        <div class="form-label-group select required">
          <v-select
            label="name"
            v-validate="'required'"
            data-vv-name="role"
            v-model="form.roleId"
            :placeholder="$t('Permissions')"
            :reduce="role => role.id"
            :options="roles"
            :disabled="form.busy"
            :class="{'is-invalid':$validateState('role', form)===false, 'is-valid':$validateState('role', form)===true}"
          ></v-select>
          <label for="role">{{ $t('Permissions') }}</label>
          <b-form-invalid-feedback>{{ $displayError('role', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>

      <!--<b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="phone"
            :disabled="form.busy"
            v-model="form.phone"
            :placeholder="$t('Phone')"
            type="text"
            name="phone"
            :state="$validateState('phone', form)"
            v-validate="'min:4'"
          ></b-form-input>
          <label for="phone">{{ $t('Phone') }}</label>
          <b-form-invalid-feedback>{{ $displayError('phone', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>-->
    </b-row>
    <b-row>
      <b-col>
        <hr />
        <loading-button
          block
          size="lg"
          type="submit"
          :disabled="vErrors.any()||form.busy"
          :loading="form.busy"
          variant="primary"
        >{{ $t('Save changes')}}</loading-button>
        <div v-if="mode==='edit'" class="mt-3 text-center">
          <hr />
          <b-button
            variant="link"
            type="button"
            @click.prevent="resetPassword"
            class="text-danger"
            block
          >{{ $t('Reset password') }}</b-button>
        </div>
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import GQLForm from "@/lib/gqlform";
import { /*mapState,*/ mapGetters } from "vuex";
import { User } from "@/models";

export default {
  props: {
    value: {
      type: Object,
      required: false,
      default: () => new User()
    },
    mode: {
      type: String,
      required: false,
      default: "create"
    }
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
      yearlyCosts: null
    })
  }),
  computed: {
    ...mapGetters({
      roles: "role/all",
      companyRoles: "companyRole/all",
      currentUser: "auth/user"
    })
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
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
      this.form["roleId"] = this.input.role ? this.input.role.id : null;
      this.form["companyRoleId"] = this.input.companyRole
        ? this.input.companyRole.id
        : null;
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();
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
                  id: this.input.id
                },
                null
              )
            );
          } finally {
            this.$swal.close();
          }
        }
      });
    }
  }
};
</script>