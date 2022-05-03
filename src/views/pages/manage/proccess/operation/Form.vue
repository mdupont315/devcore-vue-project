<template>
  <div>
    <inner-overlay @click="close"></inner-overlay>
    <b-card style="position:relative;z-index:1000">
      <b-form class="hide-labels" @submit.prevent="save" @keyup="$validator.validateAll()">
        <b-row>
          <b-col cols="12">
            <div class="form-group">
              <b-form-input
                id="title"
                v-model.trim="form.title"
                v-autofocus
                v-validate="'required|min:4'"
                :disabled="form.busy"
                :placeholder="$t('Operation name')"
                type="text"
                name="title"
                :state="$validateState('title', form)"
              ></b-form-input>
              <label for="title">{{ $t('Name') }}</label>
              <b-form-invalid-feedback>{{ $displayError('title', form) }}</b-form-invalid-feedback>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="form-group">
              <b-form-textarea
                id="description"
                v-model="form.description"
                :disabled="form.busy"
                :placeholder="$t('Operation description')"
                name="description"
                :state="$validateState('description', form)"
              ></b-form-textarea>
              <label for="description">{{ $t('Description') }}</label>
              <b-form-invalid-feedback>{{ $displayError('description', form) }}</b-form-invalid-feedback>
            </div>
          </b-col>
          <!-- <b-col cols="12">
            <div class="form-group">
              <company-role-selector
                v-model="form.companyRoles"
                :show-field="true"
                name="companyRoles"
                style="z-index:1;position:relative"
                :state="$validateState('companyRoles', form)"
                :items="availableRoles"
                :show-add-btn="$can('core/companyRole/create')"
              ></company-role-selector>
              <b-form-invalid-feedback>{{ $displayError('companyRoles', form) }}</b-form-invalid-feedback>
            </div>
          </b-col> -->
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
</template>
<script>
import { mapGetters } from "vuex";
import GQLForm from "@/lib/gqlform";

export default {
  props: {
    value: {
      required: true
    },
    stage: {
      required: true
    }
  },
  data: () => ({
    input: null,
    form: new GQLForm({
      // id: undefined,
      stageId: null,
      title: null,
      description: null,
      companyRoles: []
    })
  }),
  computed: {
    ...mapGetters({
      allRoles: "companyRole/all"
    }),
    // availableRoles: {
    //   get() {
    //     // return this.stage.companyRoles.map(r =>
    //     //   this.allRoles.find(o => o.id === r.id)
    //     // );
    //     return this.allRoles;
    //   }
    // }
  },
  mounted() {
    this.$store.dispatch("app/showInnerOverlay", true);
    this.input = this.value;
    this.initForm();
  },
  methods: {
    async initForm() {
			console.log(this.input);

      Object.keys(this.input || {})
        .filter(key => key in this.form)
        .forEach(key => (this.form[key] = this.input[key]));
    },
    async save() {
      await this.$validator.validateAll();
      if (!this.vErrors.any()) {
        await this.$validator.reset();
        await this.$store.dispatch("processOperation/create", this.form);
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
