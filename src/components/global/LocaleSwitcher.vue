<template>
  <div class="locale-switcher">
    🌐
    <select
      v-model="form.lang"
      class="spcustom-locales"
      @change="setPreferences()"
    >
      <option
        v-for="locale in locales"
        :key="locale.value"
        :value="locale.value"
      >
        {{ locale.text }}
      </option>
    </select>
  </div>
</template>
<script>
import { getSupportedLocales } from "../../lib/utils";
import GQLForm from "@/lib/gqlform";

export default {
  name: "LocalesSwitcher",
  props: {
    input: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    form: new GQLForm({
      lang: null,
    }),
  }),
  watch: {
    "form.lang": {
      handler(newVal) {
        this.$i18n.locale = newVal;
      },
    },
  },
  mounted() {
    Object.keys(this.input || {})
      .filter((key) => key in this.form)
      .forEach((key) => (this.form[key] = this.input[key]));
  },
  methods: {
    async setPreferences() {
      await this.$store.dispatch("auth/changeLanguage", this.form);
    },
  },
  computed: {
    locales: {
      get() {
        const items = [];
        const annotedLabels = getSupportedLocales();
        annotedLabels.forEach((element) => {
          items.push({
            text: element.name,
            value: element.code,
          });
        });
        return items;
      },
    },
  },
};
</script>
