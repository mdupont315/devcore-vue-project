<template>
  <b-form @submit.prevent="save" @keyup="$validator.validateAll()" class="hide-labels">
    <b-row>
      <b-col>
        <div class="form-label-group required">
          <b-form-input
            id="name"
            :disabled="form.busy"
            v-model="form.name"
            :placeholder="$t('Role name')"
            type="text"
            name="name"
            :state="$validateState('name', form)"
            v-validate="'required|min:4'"
            autofocus
          ></b-form-input>
          <label for="name">{{ $t('Name') }}</label>
          <b-form-invalid-feedback>{{ $displayError('name', form) }}</b-form-invalid-feedback>

          <hr />
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <loading-button
          size="lg"
          block
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

export default {
  props: {
    value: {
      type: Object,
      required: false
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
      name: null
    })
  }),
  computed: {},
  async mounted() {
    this.input = this.value;
    await this.initForm();
  },
  methods: {
    async initForm() {
      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
    },
    async save() {
      try {
        await this.$validator.validateAll();
        if (!this.vErrors.any()) {
          await this.$validator.reset();
          if (this.mode === "edit") {
            this.input = await this.$store.dispatch(
              "companyRole/update",
              this.form
            );
          } else {
            this.input = await this.$store.dispatch(
              "companyRole/create",
              this.form
            );
          }
          await this.initForm();
          this.$emit("input", this.input);
          this.$emit("done");
        }
      } catch (ex) {
        console.error(ex.message);
      }
    }
  }
};
</script>