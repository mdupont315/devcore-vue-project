<template>
  <div class="idea_edit_container">
    <idea-edit-content
      :user="user"
      :idea="getIdea"
      :ideaContentCategories="ideaContentCategories"
      :isLoading="isLoading || ideaForm.busy || contentForm.busy"
      @selectedType="setContentType"
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
import { mapGetters } from "vuex";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  async created() {
    // await this.$store.dispatch("ideaContent/findAll", { force: true });
    this.isLoading = true;
    this.filter = {
      data: {
        where: {
          field: "idea_id",
          op: "eq",
          value: this.idea.id,
        },
      },
    };
    await this.$store.dispatch("ideaContent/findAll", {
      filter: this.filter,
      force: true,
    });

    await this.initializeForms();
    this.isLoading = false;
  },
  data: () => ({
    filter: null,
    selectedCategoryIndex: 0,
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
    contentForm: new GQLForm({
      id: undefined,
      markup: null,
      ideaId: null,
      version: 1,
      contentType: null,
    }),

    ideaContentCategories: [
      {
        name: "Cheatsheet",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
      {
        name: "Learn",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
      {
        name: "Custom",
        contentForm: new GQLForm({
          id: undefined,
          markup: null,
          ideaId: null,
          version: 1,
          contentType: null,
        }),
      },
    ],

    isLoading: false,
  }),
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
    ...mapGetters({
      ideaContents: "ideaContent/all",
    }),
    getIdea: {
      get() {
        return this.idea;
      },
    },
    getIdeaPath: {
      get() {
        return this.ideaForm;
      },
    },
    getIdeaContent: {
      get() {
				console.log(this.ideaForm)
        const contentForm =
          this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
        return {
          contentType: contentForm.contentType,
          markup: JSON.parse(contentForm.markup),
        };
      },
      set(value) {
        const contentForm =
          this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
        contentForm.markup = JSON.stringify(value.markup);
        contentForm.contentType = value.contentType;
      },
    },
  },
  methods: {
    setContentType(item) {
      this.isLoading = true;
      this.selectedCategoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.name === item.name
      );
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
    formFieldMapper(mapTo, mapFrom) {
      Object.keys(mapTo.fields || {})
        .filter((key) => key in mapFrom)
        .forEach((key) => {
          mapTo[key] = mapFrom[key];
        });
    },
    async initializeForms() {
      this.ideaFormFieldMapper();
      this.ideaContentFormFieldMapper();
    },
    ideaFormFieldMapper() {
      const mapToIdea = this.ideaForm;
      const mapFromIdea = Object.assign(this.idea, {});
      this.formFieldMapper(mapToIdea, mapFromIdea);
    },
    ideaContentFormFieldMapper() {
      if (this.idea && this.idea.ideaContentId) {
        this.ideaContents.map((content) => {
          const mapToCategory = this.ideaContentCategories.find(
            (category) => category.name === content.contentType
          );
          const mapFromIdeaContent = Object.assign(content, {});
          this.formFieldMapper(mapToCategory.contentForm, mapFromIdeaContent);
        });
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
          const contentForm =
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
          if (contentForm.id) {
            this.contentForm.ideaId = this.idea.id;
            ideaContent = await this.$store.dispatch(
              `ideaContent/update`,
              contentForm
            );
          } else {
            ideaContent = await this.$store.dispatch(
              `ideaContent/create`,
              contentForm
            );
            const mapTo = contentForm;
            const mapFrom = Object.assign(ideaContent, {});
            this.formFieldMapper(mapTo, mapFrom);
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
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
