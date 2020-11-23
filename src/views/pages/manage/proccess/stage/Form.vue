<template>
  <div>
    <div class="p-2">
      <b-card>
        <b-form class="hide-labels" @submit.prevent="save" @keyup="$validator.validateAll()">
          <b-row>
            <b-col cols="12">
              <div class="form-group">
                <b-form-input
                  id="name"
                  v-model="form.title"
                  v-autofocus
                  v-validate="'required|min:4'"
                  :disabled="form.busy"
                  :placeholder="$t('Stage name')"
                  type="text"
                  name="title"
                  :state="$validateState('title', form)"
                  autofocus
                ></b-form-input>
                <label for="name">{{ $t('Name') }}</label>
                <b-form-invalid-feedback>{{ $displayError('title', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
            <b-col cols="12">
              <div class="form-group">
                <company-role-selector
                  v-model="form.companyRoles"
                  :show-field="true"
                  name="companyRoles"
                  style="z-index:1;position:relative"
                  :state="$validateState('companyRoles', form)"
                  :show-add-btn="$can('core/companyRole/create')"
                ></company-role-selector>
                <b-form-invalid-feedback>{{ $displayError('companyRoles', form) }}</b-form-invalid-feedback>
              </div>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <loading-button
                type="submit"
                size="lg"
                block
                :loading="form.busy"
                :disabled="vErrors.any()||form.busy"
              >{{ $t('Save changes') }}</loading-button>
            </b-col>
          </b-row>
        </b-form>
      </b-card>
    </div>
  </div>
</template>
<script>
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    value: {
      required: true
    }
  },
  data: () => ({
    input: null,
    form: new GQLForm({
      // id: undefined,
      processId: null,
      title: null,
      companyRoles: []
    })
  }),
  mounted() {
    this.$store.dispatch("app/showInnerOverlay", true);
    this.input = this.value;
    this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("processStage/create", this.form);
        this.close();
      }
    },
    close() {
      this.$store.dispatch("app/showInnerOverlay", false);
      this.$emit("close");
    }
  }
};
</script>