<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="hide-labels">
    <b-row>
      <b-col>
        <div class="form-label-group required">
          <b-form-input
            id="name"
            :disabled="form.busy"
            v-model="form.title"
            :placeholder="$t('Name of process')"
            type="text"
            name="title"
            :state="$validateState('title', form)"
            v-validate="'required|min:4'"
            autofocus
          ></b-form-input>
          <label for="title">{{ $t('Name of process') }}</label>
          <b-form-invalid-feedback>{{ $displayError('title', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
    </b-row>
    <!--<b-row>
      <b-col style="z-index:1">
        <div class="form-label-group required">
          <role-selector
            name="companyRoles"
            :class="{'is-invalid':$displayError('companyRoles', form)}"
            v-model="form.companyRoles"
            v-validate="'required'"
          ></role-selector>
          <b-form-invalid-feedback>{{ $displayError('companyRoles', form) }}</b-form-invalid-feedback>
        </div>
      </b-col>
    </b-row>-->
    <b-row>
      <b-col>
        <loading-button
          block
          size="lg"
          v-autofocus:autoselect
          type="submit"
          :disabled="vErrors.any()||form.busy"
          :loading="form.busy"
          variant="primary"
        >{{ $t('Save changes')}}</loading-button>
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import GQLForm from "@/lib/gqlform";
//import { /*mapState,*/ mapGetters } from "vuex";
//import RoleSelector from "./RoleSelector";
export default {
  components: {
    //"role-selector": RoleSelector
  },
  data: () => ({
    form: new GQLForm({
      title: null
      //companyRoles: []
    })
  }),
  computed: {},
  async mounted() {
    this.initForm();
  },
  methods: {
    async initForm() {},
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        const process = await this.$store.dispatch("process/create", this.form);
        await this.$store.dispatch("process/setCurrentProcess", {
          section: "process",
          process: process,
          stage: null,
          operation: null,
          phase: null
        });
        this.initForm();
        this.$emit("input", process);
        this.$emit("done");
      }
    },
    changed(input) {
      console.log(input);
    }
  }
};
</script>