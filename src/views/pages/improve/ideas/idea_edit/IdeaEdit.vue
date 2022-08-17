<template>
  <div class="idea_edit-wrapper">
    <div class="idea_edit_container">
      <idea-edit-content
        :idea="getIdea"
        :ideaContentCategories="ideaContentCategories"
        :isLoading="isLoading"
        :selectedCategoryIndex="selectedCategoryIndex"
        :comments="getCommentsFromContent()"
        @changeType="changeContentType"
        @fileAdded="setFile"
        @fileRemoved="removeFile"
        @saveIdeaContent="saveIdeaVersion"
        @saveIdeaContentArea="saveIdeaAreaVersion"
        @editorLoaded="setEditorLoaded"
        @isDirty="setIsContentDirty"
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
        :ideaContentIsDirty="ideaContentIsDirty"
        :editorLoaded="editorLoaded && isLoaded"
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
import { Idea } from "@/models";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  async created() {
    console.log("CREATED!");
    this.isLoading = true;
    if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
      await this.initializeData();
      await this.initializeForms();
    }

    if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "CREATE") {
      this.newIdea = new Idea();
      this.isLoaded = true;
    }

    this.isLoading = false;
  },
  data: () => ({
    filter: null,
    isSaving: false,
    isLoaded: false,
    filesChanged: false,
    selectedCategoryIndex: 0,
    ideaContentIsDirty: false,
    editorLoaded: false,
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
      companyToolIds: [],
      description: null,
      title: null,
      type: null,
    }),
    defaultContentForm: new GQLForm({
      id: undefined,
      markup: null,
      ideaId: null,
      version: 1,
      contentType: null,
      companyRoles: [],
    }),
    // ideaContentCategories: [],

    ideaContentCategories: [
      {
        contentForm: new GQLForm({
          id: undefined,
          contentType: "Unnamed",
          isPrimary: true,
          markup: JSON.stringify({
            type: "doc",
            content: [
              {
                attrs: {
                  indent: 0,
                },
                type: "paragraph",
              },
            ],
          }),
          ideaId: null,
          version: 1,
        }),
      },
    ],
    newIdea: null,
    isLoading: false,
    files: [],
  }),
  computed: {
    ...mapGetters({
      ideaContents: "ideaContent/all",
      ideaInEdit: "idea/ideaInEdit",
      currentProcess: "process/current",
      companyRoles: "companyRole/all",
    }),
    processPath: {
      get() {
        return this.currentProcess("ideas");
      },
    },
    getIdea: {
      get() {
        const idea = this.ideaInEdit?.editIdea || null;
        if (idea) {
          return idea;
        } else {
          return this.newIdea;
        }
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
    if (this.ideaInEdit) {
      await this.$store.dispatch("idea/setIdeaInEdit", null);
    }
  },
  mounted() {
    if (this.getIdea && this.getIdea.id) {
      const companyRoleIds =
        this.getIdea && this.getIdea.companyRoleIds
          ? this.getIdea.companyRoleIds
          : [];
      const companyToolIds =
        this.getIdea && this.getIdea.companyToolIds
          ? this.getIdea.companyToolIds
          : [];
      this.ideaForm._fields.companyRoleIds = companyRoleIds;
      this.ideaForm._fields.companyToolIds = companyToolIds;
    }
  },
  methods: {
    changeContentType(form) {
      this.selectedCategoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.contentForm.id === form.id
      );
      this.isLoading = true;
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
    setEditorLoaded() {
      this.editorLoaded = true;
    },
    setIsContentDirty() {
      this.ideaContentIsDirty = true;
    },
    removeFile(file) {
      if (this.isSaving) return;
      if (file.uuid) {
        this.files = this.files.filter((_file) => _file.uuid !== file.uuid);
      }
      if (file.src && file.id) {
        this.filesChanged = true;
        this.ideaForm._fields.removeFileIds.push(file.id);
      }
    },
    async setFile(file) {
      const items = [...this.files, file];
      this.files = items;
      this.filesChanged = true;
    },

    formFieldMapper(mapTo, mapFrom) {
      this.editorLoaded = false;
      Object.keys(mapTo.fields || {})
        .filter((key) => key in mapFrom)
        .forEach((key) => {
          mapTo[key] = mapFrom[key];
        });

      this.editorLoaded = true;
    },
    async initializeData() {
      const { ideaContentId } = this.getIdea;
      this.ideaContentCategories = this.ideaContents.map((content) => {
        return {
          contentForm: new GQLForm({
            id: content.id,
            markup: null,
            ideaId: null,
            version: 1,
            contentType: "",
            companyRoles: [],
            isPrimary: content.id === ideaContentId,
          }),
        };
      });
      console.log(this.ideaContentCategories);
      console.log(ideaContentId);
      console.log("idea in edit: ", this.ideaInEdit);
      //TODO: content initializes wrong content
      // maybe due to idea not fetched from database
      // change idea/all to findById with filter in idea card maybe
      // or use idea from store edit ideaContentid that sets timestamps etc
      const categoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.contentForm.id === ideaContentId
      );
      console.log(categoryIndex);
      this.selectedCategoryIndex = categoryIndex >= 0 ? categoryIndex : 0;
    },
    async initializeForms() {
      if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
        this.ideaFormFieldMapper();
        this.ideaContentFormFieldMapper();
      }
    },
    ideaFormFieldMapper() {
      const mapToIdea = this.ideaForm;
      const mapFromIdea = Object.assign(this.getIdea, {});
      this.formFieldMapper(mapToIdea, mapFromIdea);
      this.isLoaded = true;
    },

    ideaContentFormFieldMapper() {
      if (this.getIdea && this.getIdea.ideaContentId) {
        this.ideaContents.map((content) => {
          const mapToCategory = this.ideaContentCategories.find((category) => {
            return category.contentForm.id == content.id;
          });
          const mapFromIdeaContent = Object.assign(content, {});
          this.formFieldMapper(mapToCategory.contentForm, mapFromIdeaContent);
        });
      }
    },
    setFileUrls(content, files) {
      const parsedContent = JSON.parse(content);
      parsedContent.content.forEach((node) => {
        if (node.type === "file") {
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
      this.ideaForm._fields.file = this.files
        .map((fileEntity) => fileEntity.file)
        .filter((x) => x.size && !x.uri);

      let ideaSave = null;
      this.ideaForm.processId = this.processPath.process.id;
      if (this.ideaForm.id) {
        ideaSave = await this.$store.dispatch(`idea/update`, this.ideaForm);
      } else {
        ideaSave = await this.$store.dispatch(`idea/create`, this.ideaForm);
      }

      this.files = [];
      this.ideaForm._fields.removeFileIds = [];

      return ideaSave;
    },
    getImageNodesFromContent() {
      const { markup } = this.getIdeaContent;
      const imageNodes =
        markup?.content.filter((node) => node.type === "file") ?? [];

      return imageNodes;
    },
    getCommentNodesFromContent() {
      const { markup } = this.getIdeaContent;
      const commentNodes =
        markup?.content.filter((node) => node.type === "comment") ?? [];

      return commentNodes;
    },

    getCommentsFromContent() {
      const commentNodes = this.getCommentNodesFromContent();
      const contentCommentIds = [];

      commentNodes.forEach((node) => {
        const parsedComment = JSON.parse(node.attrs.comment);
        parsedComment.comments.forEach((comment) =>
          contentCommentIds.push({ id: comment.id, type: comment.type })
        );
      });
      return contentCommentIds;
    },

    async syncContent() {
      //sync files
      this.syncFiles();

      //sync comments
      await this.closeRemovedComments();
    },

    syncFiles() {
      const fileNodesInContent = this.getImageNodesFromContent();
      const allFilesInContent = fileNodesInContent.map((x) => x.attrs);
      const savedFiles = this.getIdea.files.map((file) => file.uri);

      if (allFilesInContent.length > 0) {
        savedFiles.forEach((uri) => {
          const contentFileIds = allFilesInContent.map((x) => x.id);
          if (
            !contentFileIds.includes(uri) &&
            !this.ideaForm._fields.removeFileIds.includes(uri)
          ) {
            this.ideaForm._fields.removeFileIds.push(uri);
          }
        });
      }

      // dont remove files that actually exist in content
      const allFilesInContentIds = allFilesInContent.map((x) => x.id);

      const contentFileUuids = this.files.map((x) => x.uuid);

      this.files = this.files.filter((file) => {
        if (file.uuid && contentFileUuids.includes(file.uuid)) {
          return true;
        }
        return false;
      });

      this.ideaForm._fields.removeFileIds =
        this.ideaForm._fields.removeFileIds.filter((uri) => {
          if (allFilesInContentIds.includes(uri)) return false;
          return true;
        });

      if (fileNodesInContent.length === 0) {
        this.ideaForm._fields.removeFile = true;
      } else {
        this.ideaForm._fields.removeFile = false;
      }
    },
    async closeRemovedComments() {
      if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
        const editIdea = await this.$store.dispatch("idea/findById", {
          id: this.getIdea.id,
          force: true,
        });

        const allNotRepliedCommentIds = [
          ...editIdea.improvements.filter(
            (improvement) => !improvement.replied
          ),
          ...editIdea.problems.filter((problem) => !problem.replied),
        ].map((comment) => comment.id);

        const contentComments = this.getCommentsFromContent();
        const contentCommentIds = contentComments.map((comment) => comment.id);

        const markRepliedToCommentIds = allNotRepliedCommentIds.filter(
          (id) => contentCommentIds.indexOf(id) < 0
        );
        if (markRepliedToCommentIds.length > 0) {
          await this.$store.dispatch(
            "idea/closeImprovementFeedback",
            new GQLForm({
              id: editIdea.id,
              improvementIds: markRepliedToCommentIds,
            })
          );
        }
      }
    },

    async saveIdeaAreaVersion(form) {
      this.isLoading = true;
      this.isSaving = true;
      console.log("formFIELDS: ", form.fields);
      const fields = {
        id: form.fields.id,
        ideaId: form.fields.ideaId,
        version: form.fields.version,
        companyRoles: form.fields.companyRoles,
        contentType: form.fields.contentType,
        isPrimary: form.fields.isPrimary,
      };
      try {
        if (form.fields.id) {
          await this.$store.dispatch(
            `ideaContent/update`,
            new GQLForm({ ...fields })
          );
        } else {
          await this.$store.dispatch(
            `ideaContent/create`,
            new GQLForm({ ...fields, markup: form.fields.markup })
          );
        }
      } catch (e) {
        console.log(e);
      } finally {

				//TODO: figure out a way to refresh ideaContentCategories array with created data
				// below query is redundant if we just manually set "firstpage" badge on UI
				// instead of fetch idea again
        await this.$store.dispatch("idea/findById", {
          id: form.fields.ideaId,
          force: true,
        });
        await this.$store.dispatch("ideaContent/findAll", {
          filter: {
            data: {
              where: {
                field: "idea_id",
                op: "eq",
                value: form.fields.ideaId,
              },
            },
          },
          force: true,
        });
        const otherContent = this.ideaContentCategories.filter(
          (content) => content.contentForm.id !== form.fields.id
        );
        otherContent.forEach((content) => {
          content.contentForm.isPrimary = false;
        });
        this.isLoading = false;
        this.isSaving = false;
      }
    },

    async saveIdeaVersion(reloadContent = true) {
      if (reloadContent) {
        window.vm.$snotify.info(this.$t("Do not close window"), {
          timeout: 5000,
          showProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
        });
        this.isLoading = true;
        this.isSaving = true;
      }

      try {
        //Sync files in server with files in content

        let ideaSave = this.getIdea;

        await this.syncContent();
        ideaSave = await this.saveIdea();

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
          contentForm.companyRoles = contentForm.companyRoles.map(
            (role) => role.id
          );

          if (contentForm.id) {
            ideaContent = await this.$store.dispatch(
              `ideaContent/update`,
              contentForm,
              { reload: reloadContent }
            );
          } else {
            ideaContent = await this.$store.dispatch(
              `ideaContent/create`,
              contentForm,
              { reload: reloadContent }
            );

            if (reloadContent) {
              const mapTo = contentForm;
              const mapFrom = Object.assign(ideaContent, {});
              this.formFieldMapper(mapTo, mapFrom);
            }
          }
        }

        if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "CREATE") {
          await this.navigateToPath();
          await this.closeIdeaEdit();
        }
        return ideaSave;
      } catch (e) {
        console.log(e);
      } finally {
        window.vm.$snotify.clear();
        this.ideaForm._fields.removeFileIds = [];
        this.isSaving = false;
        this.isLoading = false;
        this.ideaContentIsDirty = false;
      }
    },
    async navigateToPath() {
      const { stageId, operationId, phaseId } = this.ideaForm;

      const _process = this.processPath.process;
      const _stage = _process.stages?.filter((x) => x.id === stageId)[0];
      const _operation = _stage?.operations?.filter(
        (x) => x.id === operationId
      )[0];
      const _phase = _operation?.phases?.filter((x) => x.id === phaseId)[0];

      await this.$store.dispatch("process/setCurrentProcess", {
        section: "ideas",
        process: _process,
        stage: _stage,
        operation: _operation,
        phase: _phase,
      });
    },
    async updateIdeaVersionStatus() {
      this.isLoading = true;

      try {
        const editForm = new GQLForm({
          id: this.getIdea.id,
          status: this.getIdea.status === "NEW" ? "TESTING" : "ADOPTED",
        });
        await this.$store.dispatch(`idea/changeStatus`, editForm);
        this.$store.dispatch(`idea/findByProcess`, {
          id: this.getIdea.processId,
          force: true,
        });
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
        await this.closeIdeaEdit();
      }
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

      if (
        this.$router.currentRoute.query &&
        this.$router.currentRoute.query.id
      ) {
        const query = {};

        this.$router.replace({ query });
      }

      await this.$store.dispatch("idea/setIdeaInEdit", null);
    },
  },
};
</script>


<style lang="scss" scoped>
.idea_edit_container {
  width: 100%;
  // max-height: 82vh;
  height: 90%;
  overflow: hidden;
  height: 100%;
  margin-top: 0px;
  // min-height: 82vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.idea_edit-wrapper {
  //margin: 20px 10px 0 10px;
  height: 100%;
}
</style>
