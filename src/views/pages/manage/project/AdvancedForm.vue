 <template>
  <div class="page animated fadeIn">
    <b-form
      class="hide-labels"
      @submit.prevent="save"
      @keyup="$validator.validateAll()"
    >
      Users who can evaluate issues

      <div class="form-group">
        <user-selector
          v-model="advancedForm.issueEvaluationUsers"
          v-validate="'required|minlength:1'"
          :show-field="true"
          name="users"
          style="z-index: 1; position: relative"
          :items="getSelectedUsers"
          :show-add-btn="false"
        ></user-selector>
      </div>

      <hr class="mt-0" />
      <loading-button
        size="lg"
        block
        type="submit"
        :disabled="form.busy"
        :loading="form.busy"
        variant="primary"
        >{{ $t("Save changes") }}</loading-button
      >
    </b-form>
  </div>
</template>

<script>
export default {
  computed: {
    getSelectedUsers: {
      get() {
        return this.users.filter(
          (user) => this.form.userIds.indexOf(user.id) >= 0
        );
      },
    },
  },
  props: {
    form: {
      type: Object,
      default: null,
    },
    users: null,
  },

  data: () => ({
    advancedForm: {
      issueEvaluationUsers: [],
    },
  }),

  methods: {
    save() {
      this.form.busy = true;
      this.$emit("input", this.advancedForm);
      this.$emit("done");
      this.form.busy = false;
    },
  },
};
</script>

<style>
</style>
