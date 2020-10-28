<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="hide-labels">
    <b-row>
      <b-col class="col-12">
        <div class="form-label-group required">
          <b-form-input
            id="name"
            :disabled="form.busy"
            v-model="form.name"
            :placeholder="$t('Company Name')"
            type="text"
            name="name"
            :state="$validateState('name', form)"
            v-validate="'required|min:4'"
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
            :disabled="form.busy"
            v-model="form.adminEmail"
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
                  :disabled="form.busy"
                  v-model="form.currencyCode"
                  :placeholder="$t('Currency')"
                  type="text"
                  name="currencyCode"
                  :state="$validateState('currencyCode', form)"
                  v-validate="'required'"
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
      name: null,
      currencyCode: null,
      adminEmail: null,
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
    })
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