<template>
  <b-form
    class="hide-labels"
    @submit.prevent="save"
    @keyup="$validator.validateAll()"
  >
    <b-row>
      <b-col>
        <div class="form-label-group required">
          <b-form-input
            id="name"
            v-model.trim="form.title"
            v-validate="'required|min:4'"
            :disabled="form.busy"
            :placeholder="$t('Name of process')"
            type="search"
						autocomplete="off"
            name="title"
            :state="$validateState('title', form)"
						autofocus
          ></b-form-input>
          <label for="title">{{ $t("Name of process") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("title", form)
          }}</b-form-invalid-feedback>
        </div>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <loading-button
          v-autofocus:autoselect
          block
          size="lg"
          type="submit"
          :disabled="vErrors.any() || form.busy"
          :loading="form.busy"
          variant="primary"
          >{{ $t("Save changes") }}</loading-button
        >
      </b-col>
    </b-row>
  </b-form>
</template>
<script>
import GQLForm from "@/lib/gqlform";
// import { /*mapState,*/ mapGetters } from "vuex";
// import RoleSelector from "./RoleSelector";
export default {
  components: {
    // "role-selector": RoleSelector
  },
  data: () => ({
    form: new GQLForm({
      title: null,
      // companyRoles: []
    }),
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
          process,
          stage: null,
          operation: null,
          phase: null,
        });
        this.initForm();
        this.$emit("input", process);
        this.$emit("done");
      }
    },
  },
};
</script>
