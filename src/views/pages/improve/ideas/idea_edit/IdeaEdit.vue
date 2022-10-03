<template>
  <div class="idea_edit-wrapper">
    <div class="idea_edit_container">
      <idea-edit-content
        :idea="getIdea"
        :ideaContentCategories="ideaContentCategories"
        :isLoading="isLoading"
        :selectedCategoryIndex="selectedCategoryIndex"
        :comments="getCommentNodesFromContent()"
				:selectedIdeaRoles="ideaForm.companyRoleIds"
        @changeType="changeContentType"
        @fileAdded="setFile"
        @fileRemoved="removeFile"
        @saveIdeaContent="saveIdeaVersion"
        @saveIdeaContentArea="saveIdeaAreaVersion"
        @removeIdeaContentArea="removeIdeaContentArea"
        @editorLoaded="setEditorLoaded"
        @isDirty="setIsContentDirty"
        @setIsLoading="setIsLoading"
        :ideaContentIsDirty="ideaContentIsDirty"
        :isSaving="isSaving"
        v-model="getIdeaContent"
      ></idea-edit-content>
      <idea-edit-path
        @close="closeIdeaEdit"
        @save="saveIdeaVersion"
        @deleteIdea="deleteIdeaVersion"
        @updateStatus="updateIdeaVersionStatus"
        @cleanIdeaPath="setIsCleanIdeaPath"
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
    this.setIsLoading(true);
    if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "EDIT") {
      await this.initializeData();
      await this.initializeForms();
    }

    if (this.ideaInEdit && this.ideaInEdit.editIdeaMode === "CREATE") {
      this.newIdea = new Idea();
      this.isLoaded = true;
    }

    this.setIsLoading(false);
  },
  data: () => ({
    filter: null,
    isSaving: false,
    isLoaded: false,
    filesChanged: false,
    selectedCategoryIndex: 0,
    ideaContentIsDirty: null,
    editorLoaded: false,
    loadedFiles: [],
    isIdeaPathClean: true,
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
      isPrimary: false,
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
				const ideaContentId = this.getIdea?.ideaContentId
        if (ideaContentId) {
          return this.ideaContents.map((content) => {
            const { contentForm } = this.ideaContentCategoryData.find(
              (category) => {
                return category.contentForm.id === content.id;
              }
            ) || {
              contentForm: new GQLForm({
                id: undefined,
                markup: defaultContent,
                ideaId: null,
                version: 1,
                isPrimary: false,
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
          this.ideaContentCategories[this.selectedCategoryIndex]?.contentForm;


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

      this.loadedFiles = await this.getFileNodesFromIdea();
    } else {
      this.defaultContentForm.fields.contentType = this.$t("unnamed_type");
      this.defaultContentForm.fields.markup = JSON.stringify(defaultContent);
    }
  },
  methods: {
    setIsCleanIdeaPath(val) {
      this.isIdeaPathClean = val;
    },
    setIsLoading(val) {
      this.isLoading = val;
    },
    sliceIntoChunks(arr, chunkSize) {
      const res = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
      }
      return res;
    },

    async removeFiles(ids) {
      try {
        await this.$store.dispatch(
          `idea/removeResources`,
          new GQLForm({
            id: this.ideaForm.id,
            removeFileIds: ids,
          })
        );
      } catch (e) {
        console.log(e);
      }
    },
    async uploadFiles(files, props) {
      console.log("UPLOADING FILES: ", files);
      const { id, contentId } = props;
      let result = [];

      try {
        result = await this.$store.dispatch(
          `idea/setResources`,
          new GQLForm({
            files,
            id,
            contentId,
          })
        );
      } catch (e) {
        console.log(e);
      }

      console.log("RECEIVED FILES", result);
      return result;
    },

    async batchUploadResources(data) {
      const BATCH_MAX_FILES = 10;

      const uploadFileBatches = this.sliceIntoChunks(
        data.files,
        BATCH_MAX_FILES
      );

      window.vm.$snotify.info(
        this.$t("Saving resources", { amount: data.files.length }),
        {
          timeout: 10000,
          showProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
      this.setIsLoading(true);
      this.isSaving = true;
      let result = [];

      try {
        //Last response has every data point so overwrite result
        for (const uploadFileBatch of uploadFileBatches) {
          result = await this.uploadFiles(uploadFileBatch, data);
        }
      } catch (e) {
        console.log(e);
      } finally {
        window.vm.$snotify.clear();
      }
      return result;
    },
    async changeContentType(form, newCategories) {
      let categories = newCategories;

      if (!categories) {
        categories = this.ideaContentCategories;
      }
      this.selectedCategoryIndex = categories.findIndex(
        (content) => content.contentForm.id === form.id
      );
      this.loadedFiles = await this.getFileNodesFromIdea();
      this.files = [];
      this.setIsLoading(true);

      setTimeout(() => {
        this.setIsLoading(false);
      }, 200);
    },
    setEditorLoaded() {
      this.editorLoaded = true;
    },
    setIsContentDirty() {
      const contentForm =
        this.ideaContentCategories[this.selectedCategoryIndex]?.contentForm;

      if (contentForm && contentForm.id) {
        this.ideaContentIsDirty = contentForm.id;
      }
    },
    removeFile(file) {
      //TODO: If loaded files contains uploaded file it means that existing file was removed
      if (this.isSaving) return;
      if (file.id) {
        if (this.loadedFiles.some((loadedFile) => loadedFile.id === file.id)) {
          this.filesChanged = true;
          // if (!this.ideaForm._fields.removeFileIds.includes(file.id)) {
          //   this.ideaForm._fields.removeFileIds.push(file.id);
          // }
        }
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
      this.loadedFiles = await this.getFileNodesFromIdea();
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
      let searchMarkup = argMarkup;

      if (!searchMarkup) {
        const contentForm =
          this.ideaContentCategories[this.selectedCategoryIndex].contentForm;
        searchMarkup = contentForm.markup;
      }

      const filesInIdea = [];
      await this.execCallbackToNodeType(searchMarkup, "file", (node) => {
        filesInIdea.push(node);
      });

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

    async userRemovedResources(argMarkup = null) {
      const contentFiles = await this.getFileNodesFromIdea(argMarkup);

      console.log(contentFiles);
      const mountedUploadedFileIds = this.loadedFiles.map(
        (loaded) => loaded.attrs.id ?? loaded.attrs.uuid
      );

      const currentUploadedContentFileIds = contentFiles
        .filter((node) => node.attrs.id ?? node.attrs.uuid)
        .map((node) => node.attrs.id ?? node.attrs.uuid);

      console.log(currentUploadedContentFileIds);

      return mountedUploadedFileIds.filter(
        (id) => id && !currentUploadedContentFileIds.includes(id)
      );
    },
    async saveIdea() {
      let ideaSave = null;

      try {
        this.ideaForm._fields.removeFileIds = [];
        this.ideaForm._fields.file = [];
        this.ideaForm.processId = this.processPath.process.id;
        if (this.ideaForm.id) {
          ideaSave = await this.$store.dispatch(`idea/update`, this.ideaForm);
        } else {
          ideaSave = await this.$store.dispatch(`idea/create`, this.ideaForm);
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.isIdeaPathClean = false;
      }
      return ideaSave;
    },
    async syncIdeaResources(ideaId) {
      let resources = [];

      try {
        const contentFiles = await this.getFileNodesFromIdea();
        console.log(contentFiles);
        const addedFiles = contentFiles.filter((node) => !node.attrs.id);

        const addedFilesNotRemoved = this.files.filter((file) =>
          addedFiles.map((node) => node.attrs.uuid).includes(file.uuid)
        );

        // TODO REMOVE FILES WHEN CONTENT AREA REMOVED

        const removeFileIds = await this.userRemovedResources();

        console.log(removeFileIds);

        if (removeFileIds.length > 0) {
          await this.removeFiles(removeFileIds);
        }

        if (addedFilesNotRemoved.length > 0) {
          const contentForm =
            this.ideaContentCategories[this.selectedCategoryIndex].contentForm;

          const uploadParameters = {
            files: addedFilesNotRemoved,
            id: ideaId ?? this.ideaForm.id,
            contentId: contentForm.id,
          };

          resources = await this.batchUploadResources(uploadParameters);
        }
      } catch (e) {
        console.log(e);
      }

      if (resources && resources.files) {
        resources = resources.files.map((resource) => {
          const { id, title, size, uri, url } = resource;
          let key = title;
          if (resource.properties) {
            const parsedProperties = JSON.parse(resource.properties);
            //fileNode uuid stored in properties
            key = parsedProperties.content_key;
          }
          return {
            id,
            title,
            size,
            uri,
            url,
            key,
          };
        });
      }

      return resources;
    },

    getCommentNodesFromContent() {
      return this.ideaContents.map((content) => {
        const id = content.id;
        const contentType = content.contentType;
        let comments = {
          improvements: 0,
          problems: 0,
        };
        if (content.markup) {
          const markup = JSON.parse(content.markup);
          const commentNodes =
            markup?.content?.filter((node) => node.type === "comment") ?? [];

          commentNodes.forEach((node) => {
            if (node.type !== "comment") return;

            const commentContent = JSON.parse(node.attrs.comment);
            commentContent.comments.forEach((commentNode) => {
              if (commentNode.type === "IMPROVEMENT") {
                comments.improvements += 1;
              }
              if (commentNode.type === "PROBLEM") {
                comments.problems += 1;
              }
            });
          });
        }
        return { id, contentType, comments };
      });
    },

    async syncContent() {
      //sync files
      //  this.syncFiles();

      //sync comments
      await this.closeRemovedComments();
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

        const { markup } = this.getIdeaContent;

        const contentComments =
          markup?.content?.filter((node) => node.type === "comment") ?? [];

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
      this.setIsLoading(true);

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
        this.setIsLoading(false);
        this.isSaving = false;
      }
    },
    async removeIdeaContentArea(form) {
      this.setIsLoading(true);
      this.isSaving = true;

      // check current active form
      const currentSelectedFormId =
        this.ideaContentCategories[this.selectedCategoryIndex].contentForm.id;

      console.log(currentSelectedFormId);

      // is removing form that is visible. We need to set another page active before remove

      // remove removal form from local data
      this.ideaContentCategoryData = [
        ...this.ideaContentCategoryData.filter(
          (x) => x.contentForm.id !== form.id
        ),
      ];

			console.log(currentSelectedFormId === form.id)

      if (currentSelectedFormId === form.id) {
        this.setContentActive();
      } else {
        this.setContentActive(currentSelectedFormId);
      }


      try {
        const removeForm = new GQLForm({
          id: form.fields.id,
        });
        await this.$store.dispatch(`ideaContent/delete`, removeForm);

        const contentFiles = await this.getFileNodesFromIdea(
          form.fields.markup
        );

        console.log({ contentFiles });

        if (contentFiles.length > 0) {
          await this.removeFiles(contentFiles.map((x) => x.attrs.id));
        }
      } catch (e) {
        console.log(e);
      } finally {
        await this.fetchIdeaContents(form.fields.ideaId, false);
				await this.initializeData(currentSelectedFormId)

        this.setIsLoading(false);
        this.isSaving = false;
      }
    },

    setContentActive(contentId) {
      const { ideaContentId } = this.getIdea;
      const homeContent = this.ideaContentCategoryData.find(
        (content) => content.contentForm?.id === contentId ?? ideaContentId
      );

      const homeForm =
        homeContent?.contentForm ?? this.ideaContentCategoryData[0].contentForm;

      this.changeContentType(homeForm);
    },

    async fetchIdeaContents(id, byPassCache = true) {
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
        force: byPassCache,
      });
    },

    async saveIdeaVersion(reloadContent = true) {
      if (reloadContent) {
        window.vm.$snotify.info(this.$t("Do not close window"), {
          timeout: 10000,
          showProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
        });
        this.setIsLoading(true);
        this.isSaving = true;
      }

      let ideaSave, resources;
      try {
        //Sync files in server with files in content

        await this.syncContent();
        ideaSave = this.getIdea;

        if (!this.isIdeaPathClean || !this.getIdea.id) {
          ideaSave = await this.saveIdea();
        }

        resources = await this.syncIdeaResources(ideaSave.id);

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

                // console.log({
                //   node,
                //   title: node.attrs.title,
                //   hrefMatch,
                //   srcMatch,
                // });

                if (!isAlreadyUploadedNode) {
                  const uploadedFile = resources.find(
                    (file) => file.key === node.attrs.uuid
                  );
                  node.attrs.src = "";
                  node.attrs.href = "";

                  if (!uploadedFile) {
                    console.log({ node });
                    console.log(resources.map((x) => x.key));
                  }

                  //  console.log({ uploadedFile });
                  if (uploadedFile) {
                    node.attrs.id = uploadedFile.uri;
                    node.attrs.uuid = uploadedFile.uuid;
                    if (
                      node.attrs["data-type"] &&
                      node.attrs["data-type"] === "image"
                    ) {
                      node.attrs.preview = true;
                      node.attrs.src = uploadedFile.url;
                      node.attrs.href = "";
                      node.attrs.uri = uploadedFile.uri;
                      node.attrs.size = uploadedFile.size;
                    } else {
                      node.attrs.preview = false;
                      node.attrs.href = uploadedFile.url;
                      node.attrs.src = "";
                      node.attrs.uri = uploadedFile.uri;
                      node.attrs.size = uploadedFile.size;
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
        this.setIsLoading(false);
        this.ideaContentIsDirty = null;
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
      this.setIsLoading(true);

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
        this.setIsLoading(false);
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
