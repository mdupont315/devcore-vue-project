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
        @removeIdeaContentArea="removeIdeaContentArea"
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
import defaultContent from "./layout/templates/default";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  async created() {
    this.isLoading = true;
    if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
      console.log("created");
      console.log(this.ideaContentCategories);
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
    loadedFiles: [],
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
      isPrimary: true,
      contentType: null,
      companyRoles: [],
    }),
    newIdea: null,
    isLoading: false,
    ideaContentCategoryData: [],
    files: [],
  }),
  //TODO: Check that ideaContents get refreshed!
  computed: {
    ...mapGetters({
      ideaContents: "ideaContent/all",
      ideaInEdit: "idea/ideaInEdit",
      allRoles: "companyRole/all",
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
    ideaContentCategories: {
      get() {
        const { ideaContentId } = this.getIdea;
        if (ideaContentId) {
          return this.ideaContents.map((content) => {
            const { contentForm } = this.ideaContentCategoryData.find(
              (category) => category.contentForm.id === content.id
            ) || {
              contentForm: new GQLForm({
                id: undefined,
                markup: defaultContent,
                ideaId: null,
                version: 1,
                isPrimary: true,
                contentType: null,
                companyRoles: [],
              }),
            };

            Object.keys(content || {})
              .filter((key) => key in contentForm)
              .forEach((key) => (contentForm[key] = content[key]));
            return { contentForm };
          });
        } else {
          return [
            {
              contentForm: this.defaultContentForm,
            },
          ];
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
  async mounted() {
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

      console.log("MOUNT!");

      this.loadedFiles = await this.getFileNodesFromIdea();
    } else {
      this.defaultContentForm.fields.contentType = this.$t("unnamed_type");
      this.defaultContentForm.fields.markup = JSON.stringify(defaultContent);
    }

    //	console.log(this,.)

    //this.files = this.getIdea.files
  },
  methods: {
    async changeContentType(form) {
      this.selectedCategoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.contentForm.id === form.id
      );
      this.loadedFiles = await this.getFileNodesFromIdea();
      this.files = [];
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
      //TODO: If loaded files contains uploaded file it means that existing file was removed
      // console.log(file);
      //console.log(this.loadedFiles);
      if (this.isSaving) return;
      if (file.id) {
        if (this.loadedFiles.some((loadedFile) => loadedFile.id === file.id)) {
          this.filesChanged = true;
          if (!this.ideaForm._fields.removeFileIds.includes(file.id)) {
            this.ideaForm._fields.removeFileIds.push(file.id);
          }
        }
      }
    },
    async setFile(file) {
      console.log("set File!");
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
    async initializeData(selectedFormId = null) {
      this.ideaContentCategoryData = this.ideaContents.map((content) => {
        return {
          contentForm: new GQLForm({
            id: content.id,
            markup: content.markup,
            ideaId: content.ideaId,
            version: content.version ?? 1,
            contentType: content.contentType,
            companyRoles: content.companyRoles,
            isPrimary: content.id === this.getIdea.ideaContentId,
          }),
        };
      });

      const selectedIndex = selectedFormId ?? this.getIdea.ideaContentId;

      const categoryIndex = this.ideaContentCategories.findIndex(
        (content) => content.contentForm.id === selectedIndex
      );
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

    async getFileNodesFromIdea(argMarkup) {
      const contentForm =
        this.ideaContentCategories[this.selectedCategoryIndex].contentForm;

      const filesInIdea = [];
      await this.execCallbackToNodeType(
        argMarkup ?? contentForm.markup,
        "file",
        (node) => {
          console.log(node.attrs.id);

          filesInIdea.push(node);
        }
      );

      return filesInIdea;
    },

    /**
     * content = stringified JSON markup
     * type = node type
     * callback = Fn()
     */
    async execCallbackToNodeType(content, type, callback) {
      const parsedContent = JSON.parse(content);
      const loopContent = (content) => {
        if (content instanceof Array) {
          content.forEach((node) => {
            if (node.type === type) {
              callback(node);
            } else if (node.content && node.content.length > 0) {
              loopContent(node.content);
            }
          });
          return content;
        }
      };

      const modifiedMarkup = loopContent(parsedContent.content);
      return JSON.stringify({ type: "doc", content: modifiedMarkup });
    },

    async saveIdea() {
      console.log("****");

      //TODO: set ideaForm.fields.file to actual files in content
      // set removeFileIds to actual files in content
      // check if possible to do these from onTransaction
      // propably better that way

      console.log(
        "loadedFiles: ",
        this.loadedFiles.map((x) => {
          return { href: x.attrs.href, id: x.attrs.id, uri: x.attrs.uri };
        })
      );

      // console.log("files: ", this.files);

      const contentFiles = await this.getFileNodesFromIdea();
      // console.log({ contentFiles });

      const currentUploadedContentFileIds = contentFiles
        .filter((node) => node.attrs.id)
        .map((node) => node.attrs.id);
      const addedFiles = contentFiles.filter((node) => !node.attrs.id);

      // console.log({ contentFiles });
      // console.log({ addedFiles });
      // console.log("uploadedContentFiles: ", currentUploadedContentFileIds);

      //compare to mounted state

      console.log(contentFiles);

      const addedFilesNotRemoved = this.files.filter((file) =>
        addedFiles.map((node) => node.attrs.uuid).includes(file.uuid)
      );

      const mountedUploadedFileIds = this.loadedFiles.map(
        (loaded) => loaded.attrs.id
      );

      console.log({ mountedUploadedFileIds });
      // const loadedFileIdsNotInContent = uploadedContentFiles.filter(
      //   (node) =>
      //     !contentFiles.map((node) => node.attrs.id).includes(node.attrs.id)
      // );

      // const contentFileUuids = contentFiles.map((node) => node.attrs.uuid);

      // console.log("___________");

      console.log(
        "REMOVING RESOURCES: ",
        mountedUploadedFileIds.filter(
          (id) => !currentUploadedContentFileIds.includes(id)
        )
      );

      console.log({ addedFilesNotRemoved });

      this.ideaForm._fields.file = addedFilesNotRemoved.map(
        (item) => item.file
      );
      // this.ideaForm._fields.fileResource = addedFilesNotRemoved.map((x) => {
      //   return { uuid: x.uuid, file: [x.file] };
      // });
      this.ideaForm._fields.removeFileIds = mountedUploadedFileIds.filter(
        (id) => !currentUploadedContentFileIds.includes(id)
      );
      console.log("FILLLLLEEE", this.ideaForm.fields);
      let ideaSave = null;
      this.ideaForm.processId = this.processPath.process.id;
      if (this.ideaForm.id) {
        ideaSave = await this.$store.dispatch(`idea/update`, this.ideaForm);
      } else {
        ideaSave = await this.$store.dispatch(`idea/create`, this.ideaForm);
      }

      console.log(ideaSave);

      return ideaSave;
    },
    // getImageNodesFromContent(argMarkup) {
    //   const { markup } = argMarkup ?? this.getIdeaContent;

    //   console.log(markup.content);
    //   const imageNodes =
    //     markup?.content?.filter((node) => node.type === "file") ?? [];

    //   return imageNodes;
    // },
    getCommentNodesFromContent() {
      const { markup } = this.getIdeaContent;

      const commentNodes =
        markup?.content?.filter((node) => node.type === "comment") ?? [];

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
      //  this.syncFiles();

      //sync comments
      await this.closeRemovedComments();
    },

    // syncFiles() {
    //   const fileNodesInContent = this.getImageNodesFromContent();

    //   console.log(fileNodesInContent);
    //   const allFilesInContent = fileNodesInContent.map((x) => x.attrs);
    //   const savedFiles = this.getIdea.files.map((file) => file.uri);

    //   //  if (allFilesInContent.length > 0) {
    //   savedFiles.forEach((uri) => {
    //     const contentFileIds = allFilesInContent.map((x) => x.id);
    //     if (
    //       !contentFileIds.includes(uri) &&
    //       !this.ideaForm._fields.removeFileIds.includes(uri)
    //     ) {
    //       this.ideaForm._fields.removeFileIds.push(uri);
    //     }
    //   });
    //   //  }

    //   // dont remove files that actually exist in content
    //   const allFilesInContentIds = allFilesInContent.map((x) => x.id);

    //   console.log(allFilesInContent);

    //   const contentFileUuids = this.files.map((x) => x.uuid);

    //   this.files = this.files.filter((file) => {
    //     if (file.uuid && contentFileUuids.includes(file.uuid)) {
    //       return true;
    //     }
    //     return false;
    //   });

    //   this.ideaForm._fields.removeFileIds =
    //     this.ideaForm._fields.removeFileIds.filter((uri) => {
    //       if (allFilesInContentIds.includes(uri)) return false;
    //       return true;
    //     });

    //   if (fileNodesInContent.length === 0) {
    //     this.ideaForm._fields.removeFile = true;
    //   } else {
    //     this.ideaForm._fields.removeFile = false;
    //   }
    // },
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

      const fields = {
        id: form.fields.id,
        ideaId: form.fields.ideaId,
        version: form.fields.version,
        companyRoles: form.fields.companyRoles.map((role) => role.id ?? role),
        contentType: form.fields.name ?? this.$t("unnamed_type"),
        isPrimary: form.fields.isPrimary,
      };

      const markup = form.fields.markup.content ?? form.fields.markup;

      let resp;

      try {
        if (form.fields.id) {
          resp = await this.$store.dispatch(
            `ideaContent/update`,
            new GQLForm({ ...fields })
          );
        } else {
          resp = await this.$store.dispatch(
            `ideaContent/create`,
            new GQLForm({ ...fields, markup })
          );
        }
      } catch (e) {
        console.log(e);
      } finally {
        await this.fetchIdeaContents(form.fields.ideaId);

        if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
          await this.refreshIdea("EDIT");
        }

        if (form.fields.isPrimary) {
          this.ideaContentCategoryData.forEach((data) => {
            const { contentForm } = data;
            contentForm.fields.isPrimary = contentForm.id === form.fields.id;
          });
        }

        this.initializeData(resp.id);

        this.isLoading = false;
        this.isSaving = false;
      }
    },
    async removeIdeaContentArea(form) {
      this.isLoading = true;
      this.isSaving = true;

      //user is removing content area that is currently active

      try {
        const removeForm = new GQLForm({
          id: form.fields.id,
        });
        await this.$store.dispatch(`ideaContent/delete`, removeForm);
      } catch (e) {
        console.log(e);
      } finally {
        await this.fetchIdeaContents(form.fields.ideaId);

        if (this.ideaContentCategories[this.selectedCategoryIndex]) {
          if (
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm
              ?.id
          ) {
            const removeIndex = this.ideaContentCategories.findIndex(
              (content) => content.contentForm?.id === form.id
            );
            if (this.selectedCategoryIndex == removeIndex) {
              this.setHomeContentActive();
            }
          }
        }

        this.isLoading = false;
        this.isSaving = false;
      }
    },

    setHomeContentActive() {
      const { ideaContentId } = this.getIdea;
      const homeContent = this.ideaContentCategoryData.find(
        (content) => content.contentForm?.fields.id === ideaContentId
      );

      const homeForm =
        homeContent?.contentForm ?? this.ideaContentCategoryData[0].contentForm;

      this.changeContentType(homeForm);
    },

    async fetchIdeaContents(id) {
      await this.$store.dispatch("ideaContent/findAll", {
        filter: {
          data: {
            where: {
              field: "idea_id",
              op: "eq",
              value: id,
            },
          },
        },
        force: true,
      });
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

      let ideaSave;
      try {
        //Sync files in server with files in content

        await this.syncContent();
        ideaSave = await this.saveIdea();

        if (ideaSave && ideaSave.id) {
          let ideaContent = null;

          const contentForm =
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm;

          let markup = contentForm.markup;


          if (this.files.length > 0) {
            const modifiedMarkup = await this.execCallbackToNodeType(
              markup,
              "file",
              (node) => {
                const hrefMatch =
                  node.attrs.href &&
                  node.attrs.href.includes(process.env.BASE_URL);
                const srcMatch =
                  node.attrs.src &&
                  node.attrs.src.includes(process.env.BASE_URL);
                const isAlreadyUploadedNode = hrefMatch || srcMatch;

                if (!isAlreadyUploadedNode) {
                  const setFileUri = node.attrs.title;
                  const fileInIdea = ideaSave.files.find(
                    (file) => file.title === setFileUri
                  );

                  if (fileInIdea) {
                    node.attrs.id = fileInIdea.uri;
                    node.attrs.uuid = fileInIdea.uuid;
                    if (
                      node.attrs["data-type"] &&
                      node.attrs["data-type"] === "image"
                    ) {
                      node.attrs.src = fileInIdea.url;
                      node.attrs.href = "";
                      node.attrs.uri = fileInIdea.uri;
                      node.attrs.size = fileInIdea.size;
                    } else {
                      node.attrs.href = fileInIdea.url;
                      node.attrs.src = "";
                      node.attrs.uri = fileInIdea.uri;
                      node.attrs.size = fileInIdea.size;
                    }
                  }
                }
              }
            );
            markup = modifiedMarkup;
          }
          contentForm.ideaId = ideaSave.id;
          contentForm.markup = markup;

          if (contentForm.isPrimary) {
            contentForm.companyRoles = this.allRoles.map((role) => role.id);
          } else {
            contentForm.companyRoles = contentForm.companyRoles.map(
              (role) => role.id
            );
          }

          contentForm.contentType =
            contentForm.contentType ?? this.$t("unnamed_type");

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
          await this.navigateToPath(ideaSave.uuid);
          await this.closeIdeaEdit();
        }
        return ideaSave;
      } catch (e) {
        console.log(e);
      } finally {
        window.vm.$snotify.clear();
        if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
          await this.refreshIdea("EDIT");
        }
        this.ideaForm._fields.removeFileIds = [];
        this.loadedFiles = await this.getFileNodesFromIdea();
        this.isSaving = false;
        this.isLoading = false;
        this.ideaContentIsDirty = false;
        this.files = [];
      }
    },
    async navigateToPath(ideaUuid) {
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
      // await this.$store.dispatch(`idea/setIdeaTab`, {
      //   tab: "New",
      //   uuid: ideaUuid,
      // });
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

    async refreshIdea(mode = "EDIT") {
      const editIdea = await this.$store.dispatch("idea/findById", {
        id: this.getIdea.id,
        force: true,
      });
      await this.$store.dispatch("idea/setIdeaInEdit", {
        editIdeaMeta: {
          editStartedAt: new Date().getTime(),
        },
        editIdeaMode: mode,
        editIdea: editIdea,
      });
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
  height: 90%;
  overflow: hidden;
  height: 100%;
  margin-top: 0px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.idea_edit-wrapper {
  //margin: 20px 10px 0 10px;
  height: 100%;
}
</style>
