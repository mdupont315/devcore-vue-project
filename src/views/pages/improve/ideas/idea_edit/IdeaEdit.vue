<template>
  <div class="idea_edit_container">
    <idea-edit-content
      :user="user"
      :idea="getIdea"
      :isLoading="isLoading || ideaForm.busy || contentForm.busy"
      v-model="getIdeaContent"
    ></idea-edit-content>
    <idea-edit-path
      @close="closeIdeaEdit"
      @save="saveIdeaVersion"
      @deleteIdea="deleteIdeaVersion"
      @updateStatus="updateIdeaVersionStatus"
			:isLoading="isLoading || ideaForm.busy || contentForm.busy"
      v-model="getIdeaPath"
      :idea="getIdea"
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
    this.setContentForm(this.idea);
  },
  watch: {
    idea: {
      handler(newVal) {
        // this.setContentForm(newVal);
      },
    },
  },
  data: () => ({
    isLoading: false,
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
    test: null,
  }),
  async mounted() {
    const mapTo = this.ideaForm;
    const mapFrom = Object.assign(this.idea, {});
    this.formFieldMapper(mapTo, mapFrom);
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
    getIdea: {
      get() {
        return this.idea;
      },
      set(val) {
        console.log(val);
        this.test = val;
      },
    },
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
    formFieldMapper(mapTo, mapFrom) {
      Object.keys(mapTo.fields || {})
        .filter((key) => key in mapFrom)
        .forEach((key) => {
          console.log(key);
          mapTo[key] = mapFrom[key];
        });
    },
    setContentForm(idea) {
      if (idea.ideaContent && idea.ideaContent.markup) {
        console.log("CREATED!");
        this.contentForm.id = idea.ideaContent.id;
        this.contentForm.version = idea.ideaContent.version;
        this.contentForm.markup = idea.ideaContent.markup;
        //  this.isLoading = false;
      }
    },
    async saveIdeaVersion() {
      this.isLoading = true;
      try {
        const ideaSave = await this.$store.dispatch(
          `idea/update`,
          this.ideaForm
        );
        if (ideaSave && ideaSave.id) {
          this.contentForm.ideaId = ideaSave.id;
          let ideaContent = null;
          if (this.contentForm.id) {
            this.contentForm.ideaId = this.idea.id;
            ideaContent = await this.$store.dispatch(
              `ideaContent/update`,
              this.contentForm
            );
						console.log("HELLO WORLD")
            console.log(ideaContent);
          } else {
            ideaContent = await this.$store.dispatch(
              `ideaContent/create`,
              this.contentForm
            );
            const mapTo = this.contentForm;
            const mapFrom = Object.assign(ideaContent, {});
            this.formFieldMapper(mapTo, mapFrom);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.ideaForm.busy = true;
        await this.$store.dispatch("idea/findById", {
          id: this.idea.id,
          force: true,
        });
        this.ideaForm.busy = false;
        this.isLoading = false;
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
