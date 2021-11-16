<template>
  <b-form class="hide-labels" @submit.prevent="saveItem">
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
          v-model.number="form.requiredScore"
          :max-length="15"
          autocomplete="off"
          :disabled="form.busy"
          v-validate="getScoreValidator"
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
        :placeholder="$t('Milestone reward text')"
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
          :disabled="vErrors.any() || form.busy || !form.requiredScore"
          style="cursor: pointer"
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
    prevScore: 0,
    nextScore: 0,
    form: new GQLForm({
      id: null,
      title: null,
      description: null,
      requiredScore: null,
    }),
  }),
  computed: {
    getScoreValidator: {
      get() {
        if (this.nextScore) {
          return `required|numeric|between:${this.prevScore + 1},${
            this.nextScore - 1
          }`;
        } else {
          return `required|numeric|min_value:${this.prevScore + 1}`;
        }
      },
    },
  },
  props: {
    itemMeta: {
      type: Object,
      required: false,
      default: () => {},
    },
    item: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  mounted() {
    if (this.item) this.setScoresAround();
  },
  methods: {
    setScoresAround() {
      const getIndex = () => {
        if (!this.item) return;
        return this.itemMeta.scores.findIndex((i) => i.id === this.item.id);
      };
      const prevItem = this.itemMeta.scores[getIndex()] ?? null;
      const nextItem = this.itemMeta.scores[getIndex() + 1] ?? null;

      this.prevScore = prevItem?.requiredScore ?? 0;
      this.nextScore = nextItem?.requiredScore ?? null;
    },
    async saveItem() {
      this.form.busy = true;
      const createForm = new GQLForm({
        title: this.form.title,
        description: this.form.description,
        requiredScore: this.form.requiredScore,
      });
      await this.$store.dispatch("milestone/create", createForm);

      this.form.busy = false;
      console.log("ITEM SAVED!");
      this.$emit("close");
    },
  },
};
</script>

<style>
</style>
