<template>
  <div>
    <div class="idea_edit_container" v-if="getIdea">
      <idea-edit-content
        :user="user"
        :idea="getIdea"
        :ideaContentCategories="ideaContentCategories"
        :isLoading="isLoading"
        :selectedCategoryIndex="selectedCategoryIndex"
        @fileAdded="setFile"
        @selectedType="setContentType"
        :isSaving="isSaving"
        v-model="getIdeaContent"
      ></idea-edit-content>
      <idea-edit-path
        @close="closeIdeaEdit"
        @save="saveIdeaVersion"
        @deleteIdea="deleteIdeaVersion"
        @updateStatus="updateIdeaVersionStatus"
        :isLoading="isLoading"
        v-model="getIdeaPath"
        :idea="getIdea"
      ></idea-edit-path>
    </div>
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
          value: this.getIdea.id,
        },
      },
    };
    await this.$store.dispatch("companyTool/findAll");
    await this.$store.dispatch("ideaContent/findAll", {
      filter: this.filter,
      force: true,
    });

    await this.initializeForms();
    this.isLoading = false;
  },
  data: () => ({
    filter: null,
    isSaving: false,
    selectedCategoryIndex: 2,
    ideaForm: new GQLForm({
      id: undefined,
      processId: null,
      stageId: null,
      operationId: null,
      phaseId: null,
      file: [],
      removeFile: false,
      removeFileIds: [],
			companyRoleIds: [],
      companyToolId: null,
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
    files: [],
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
      ideaInEdit: "idea/ideaInEdit",
      ideas: "idea/all",
    }),
    getIdea: {
      get() {
        const idea = this.ideas.find(
          (idea) => idea.id === this.ideaInEdit?.editIdeaId
        );
        return idea ?? null;
      },
    },
    getIdeaPath: {
      get() {
        return this.ideaForm;
      },
    },
    getIdeaContent: {
      get() {
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
  async beforeDestroy() {
    await this.closeIdeaEdit();
  },
  methods: {
    async setFile(file) {
      const items = [...this.files, file];
      this.files = items;
    },
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
      const mapFromIdea = Object.assign(this.getIdea, {});
      this.formFieldMapper(mapToIdea, mapFromIdea);
    },
    ideaContentFormFieldMapper() {
      if (this.getIdea && this.getIdea.ideaContentId) {
        this.ideaContents.map((content) => {
          const mapToCategory = this.ideaContentCategories.find(
            (category) => category.name === content.contentType
          );
          const mapFromIdeaContent = Object.assign(content, {});
          this.formFieldMapper(mapToCategory.contentForm, mapFromIdeaContent);
        });
      }
    },
    setFileUrls(content, files) {
      const parsedContent = JSON.parse(content);

      parsedContent.content.forEach((node) => {
        if (node.type === "image") {
          const setImageName = node.attrs.title;
          const fileInIdea = files.find((file) => file.title === setImageName);
          if (fileInIdea) {
            if (node.attrs.preview) {
              node.attrs.src = fileInIdea.url;
              node.attrs.id = fileInIdea.uri;
              node.attrs.href = "";
            } else {
              node.attrs.href = fileInIdea.url;
              node.attrs.id = fileInIdea.uri;
              node.attrs.src = "";
            }
          }
        }
      });

      return JSON.stringify(parsedContent);
    },
    async saveIdea() {
      this.ideaForm.fields.file = this.files.filter((x) => x.size);

      const ideaSave = await this.$store.dispatch(`idea/update`, this.ideaForm);
      this.files = [];
      this.ideaForm.removeFileIds = [];

      return ideaSave;
    },
    getImageNodesFromContent() {
      const { markup } = this.getIdeaContent;
      const imageNodes =
        markup?.content.filter((node) => node.type === "image") ?? [];
      return imageNodes;
    },
    getCommentNodesFromContent() {
      const { markup } = this.getIdeaContent;
      const commentNodes =
        markup?.content.filter((node) => node.type === "comment") ?? [];
      return commentNodes;
    },

    syncFiles() {
      //TODO: Check that idea.files (should be actual files on server)
      // matches with node content node content images

      //TODO: check that resources get deleted correctly. Currently more resources than should get deleted

      const fileNodesInContent = this.getImageNodesFromContent();
      if (fileNodesInContent.length === 0) {
        this.ideaForm.removeFile = true;
      } else {
        this.ideaForm.removeFile = false;
      }
      this.ideaForm.removeFileIds = [];

      const uploadedFilesInContent = fileNodesInContent.filter(
        (node) => node.attrs.id
      );

      const uploadedFiles = uploadedFilesInContent.map((node) => node.attrs.id);

      const removeFiles = this.getIdea.files.filter(
        (file) => !uploadedFiles.includes(file.uri)
      );
      this.ideaForm.removeFileIds = removeFiles.map((file) => file.id) ?? [];
    },
    async saveIdeaVersion() {
      this.isLoading = true;
      this.isSaving = true;
      try {
        //Sync files in server with files in content
        this.syncFiles();

        const ideaSave = await this.saveIdea();
        //reset removeFileIds

        if (ideaSave && ideaSave.id) {
          let ideaContent = null;

          const contentForm =
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
          let markup = contentForm.markup;

          if (ideaSave.files.length > 0) {
            markup = this.setFileUrls(markup, ideaSave.files);
          }
          contentForm.ideaId = ideaSave.id;
          contentForm.markup = markup;
          contentForm.contentType =
            this.ideaContentCategories[this.selectedCategoryIndex].name;

          if (contentForm.id) {
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
        return ideaSave;
      } catch (e) {
        console.log(e);
      } finally {
        this.isSaving = false;
        this.isLoading = false;
      }
    },
    async updateIdeaVersionStatus() {
      const editForm = new GQLForm({
        id: this.getIdea.id,
        status: this.getIdea.status === "NEW" ? "TESTING" : "ADOPTED",
      });
      await this.$store.dispatch(`idea/changeStatus`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.getIdea.processId,
        force: true,
      });
      await this.closeIdeaEdit();
    },
    async deleteIdeaVersion() {
      const editForm = new GQLForm({
        id: this.ideaForm.id,
      });
      await this.$store.dispatch(`idea/delete`, editForm);
      this.$store.dispatch(`idea/findByProcess`, {
        id: this.ideaForm.processId,
        force: true,
      });
      this.$store.dispatch("process/findById", {
        id: this.ideaForm.processId,
        force: true,
      });
      await this.closeIdeaEdit();
    },
    async closeIdeaEdit() {
      this.$emit("close");
      await this.$store.dispatch("idea/setIdeaInEdit", null);
    },
  },
};
</script>


<style scoped>
.idea_edit_container {
  width: 100%;
  max-height: 83vh;
  overflow: hidden;
  height: 100%;
  margin-top: 0px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
