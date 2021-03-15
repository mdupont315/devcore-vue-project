<template>
  <b-form class="hide-labels" @submit.prevent="save" @keyup="$validator.validateAll()">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="name"
            v-model="form.name"
            v-validate="'required|min:4'"
            :disabled="form.busy"
            :placeholder="$t('Company Name')"
            type="text"
            name="name"
            :state="$validateState('name', form)"
            autofocus
          ></b-form-input>
          <label for="name">{{ $t('Company Name') }}</label>
          <b-form-invalid-feedback>{{ $displayError('name', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
       <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="adminEmail"
            v-model="form.adminEmail"
            :disabled="form.busy"
            :placeholder="$t('Admin Email')"
            type="text"
            name="adminEmail"
            :state="$validateState('adminEmail', form)"
            autofocus
          ></b-form-input>
          <label for="name">{{ $t('Admin Email') }}</label>
          <b-form-invalid-feedback>{{ $displayError('adminEmail', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-select
                  id="currencyCode"
                  v-model="form.currencyCode"
                  v-validate="'required'"
                  :disabled="form.busy"
                  :placeholder="$t('Currency')"
                  type="text"
                  name="currencyCode"
                  :state="$validateState('currencyCode', form)"
                >
                  <option :value="null">--- {{ $t('None')}} ---</option>
                  <option
                    v-for="(item, index) in currencies"
                    :key="index"
                    :value="item.code"
                  >{{ item.name }} | {{ item.symbol }} ({{ item.code }})</option>
                </b-form-select>

          <label for="currencyCode">{{ $t('Currency Code') }}</label>
          <b-form-invalid-feedback>{{ $displayError('currencyCode', form) }}</b-form-invalid-feedback>
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
          :disabled="vErrors.any()||form.busy"
          :loading="form.busy"
          variant="primary"
        >{{ $t('Save changes')}}</loading-button>
        <div v-if="mode==='edit'" class="mt-3 text-center">
          <hr />
          <b-button
            variant="link"
            type="button"
            class="text-danger"
            block
            @click.prevent="resetPassword"
          >{{ $t('Reset password') }}</b-button>
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
      name: null,
      currencyCode: null,
      adminEmail: null,
			lang: null,
      // email: null,
      // phone: null,
      // avatar: null,
      // roleId: null,
      // companyRoleId: null,
      // yearlyCosts: null
    })
  }),
  computed: {
    ...mapGetters({
      roles: "role/all",
      companyRoles: "companyRole/all",
      currentUser: "auth/user",
      currencies: "currency/all",
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
  },
  async mounted() {
    this.input = this.value;
    await this.initForm();
    // await this.$store.dispatch("companyRole/findAll");
    // await this.$store.dispatch("role/findAll");
  },
  methods: {
    async initForm() {
      Object.keys(this.input)
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
      // this.form["roleId"] = this.input.role ? this.input.role.id : null;
      // this.form["companyRoleId"] = this.input.companyRole
      //   ? this.input.companyRole.id
      //   : null;
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();

          if (this.mode === "edit") {
            this.input = await this.$store.dispatch("company/update", this.form);
          } else {
            this.input = await this.$store.dispatch("company/create", this.form);
          }
          await this.initForm();
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {
        console.error(ex.message);
      }
    },


  }
};
</script>
