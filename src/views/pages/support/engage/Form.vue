<template>
  <b-form
    class="hide-labels"
    @submit.prevent="saveItem"
  >
    <b-col class="col-12">
      <div class="form-label-group required">
        <div class="form-group">
          <b-form-input
            id="title"
            v-model.trim="form.title"
            v-validate="'required|min:4'"
            v-autofocus
						autocomplete="off"
            :disabled="form.busy"
            :placeholder="$t('Milestone title')"
            type="text"
            name="title"
            :state="$validateState('title', form)"
          ></b-form-input>
          <label for="title">{{ $t("Milestone title") }}</label>
          <b-form-invalid-feedback>{{
            $displayError("title", form)
          }}</b-form-invalid-feedback>
        </div>

        <b-form-input
          id="requiredScore"
          v-model="form.requiredScore"
          :max-length="15"
          autocomplete="off"
          :disabled="form.busy"
          v-validate="'required|numeric|min_value:0|max_value:999999999999999'"
          :placeholder="$t('requiredScore')"
          type="number"
          name="requiredScore"
          :state="$validateState('requiredScore', form)"
        ></b-form-input>
        <label for="requiredScore">{{ $t("requiredScore") }}</label>
        <b-form-invalid-feedback>{{
          $displayError("requiredScore", form)
        }}</b-form-invalid-feedback>
      </div>

      <b-form-textarea
        id="description"
        v-model="form.description"
        v-autoresize
        v-validate="''"
        :disabled="form.busy"
        :placeholder="$t('Idea description')"
        style="max-height: 150px"
        name="description"
        :state="$validateState('description', form)"
      ></b-form-textarea>
      <label for="description">{{ $t("Milestone description") }}</label>
      <b-form-invalid-feedback>{{
        $displayError("description", form)
      }}</b-form-invalid-feedback>
      <b-card-footer>
        <loading-button
          :disabled="vErrors.any() || form.busy"
          :loading="form.busy"
          size="lg"
          block
          type="submit"
          >{{ $t("Save changes") }}</loading-button
        >
      </b-card-footer>
    </b-col></b-form
  >
</template>

<script>
import GQLForm from "@/lib/gqlform";

export default {
  data: () => ({
    form: new GQLForm({
      id: null,
      title: null,
      description: null,
      requiredScore: null,
      reward: "fanboy",
    }),
  }),
  methods: {
    saveItem() {
      this.$emit("input", this.form);
    },
  },
};
</script>

<style>
</style>
