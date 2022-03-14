<template>
  <div class="idea_edit_container">
    <idea-edit-content
      :user="user"
      :idea="idea"
      v-model="getIdeaContent"
    ></idea-edit-content>
    <idea-edit-path
      @close="closeIdeaEdit"
      @save="saveIdeaVersion"
      @deleteIdea="deleteIdeaVersion"
      @updateStatus="updateIdeaVersionStatus"
      v-model="getIdeaPath"
      :idea="idea"
    ></idea-edit-path>
  </div>
</template>

	<script>
import IdeaEditContent from "./layout/IdeaEditContent.vue";
import IdeaEditPath from "./layout/IdeaEditPath.vue";
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  created() {
    if (this.idea.ideaContent && this.idea.ideaContent.markup) {
      this.contentForm.id = this.idea.ideaContent.id;
      this.contentForm.version = this.idea.ideaContent.version;
      this.contentForm.markup = this.idea.ideaContent.markup;
    }
  },
  data: () => ({
    contentForm: new GQLForm({
      id: undefined,
      markup: null,
      ideaId: null,
      version: 1,
    }),
    ideaForm: new GQLForm({
      id: undefined,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      description: null,
      title: null,
      type: null,
    }),
  }),
  mounted() {
    const input = Object.assign(this.idea, {});
    Object.keys(this.ideaForm.fields || {})
      .filter((key) => key in input)
      .forEach((key) => {
        this.ideaForm[key] = input[key];
      });
  },
  props: {
    idea: {
      type: Object,
      required: false,
    },
    user: {
      type: Object,
      required: false,
    },
  },
  computed: {
    getIdeaPath: {
      get() {
        return this.ideaForm;
      },
      set(value) {
        this.ideaForm = new GQLForm({
          ...value,
        });
      },
    },
    getIdeaContent: {
      get() {
        return JSON.parse(this.contentForm.markup);
      },
      set(value) {
        this.contentForm.markup = JSON.stringify(value);
      },
    },
  },
  methods: {
    async saveIdeaVersion() {
      try {
        const ideaSave = await this.$store.dispatch(
          `idea/update`,
          this.ideaForm
        );
        if (ideaSave && ideaSave.id) {
          this.contentForm.ideaId = ideaSave.id;

          if (this.contentForm.id) {
            await this.$store.dispatch(`ideaContent/update`, this.contentForm);
          } else {
            await this.$store.dispatch(`ideaContent/create`, this.contentForm);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        await this.$store.dispatch("idea/findById", {
          id: this.idea.id,
          force: true,
        });
      }
    },
    async updateIdeaVersionStatus() {
      this.form.busy = true;
      const editForm = new GQLForm({
        id: this.idea.id,
        status: this.idea.status === "NEW" ? "TESTING" : "ADOPTED",
      });
      await this.$store.dispatch(`idea/changeStatus`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.idea.processId,
        force: true,
      });
      this.form.busy = false;
      this.closeIdeaEdit();
    },
    async deleteIdeaVersion() {
      this.form.busy = true;
      const editForm = new GQLForm({
        id: this.form.id,
      });
      await this.$store.dispatch(`idea/delete`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.form.processId,
        force: true,
      });
      this.$store.dispatch("process/findById", {
        id: this.form.processId,
        force: true,
      });
      this.form.busy = false;
    },
    closeIdeaEdit() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.idea_edit_container {
  width: 100%;
  height: 100%;
  margin-top: 0px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
