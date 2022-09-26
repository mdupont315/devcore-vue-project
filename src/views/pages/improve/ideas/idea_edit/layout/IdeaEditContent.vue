<template>
  <div class="idea_edit_content_container">
    <div class="idea_edit_content_container_content-header">
      <inner-overlay
        v-if="contentTypeSelectorVisible || contentTypeSelectorUpload"
        @click="closeContentType()"
        style="z-index: 1"
      />
      <div class="idea_edit_content_container_content-header-title">
        <div class="idea_edit_content_container_content-header-title-text">
          {{
            idea.title ? idea.title : $t("action.create", { name: $t("idea") })
          }}
        </div>
        <div
          class="idea_edit_content_container_content-header-upload"
          :style="{ 'z-index': contentTypeSelectorUpload ? 1 : 0 }"
        >
          <loading-button
            :disabled="vErrors.any() || isLoading"
            variant="primary"
            id="idea_edit_content_btnUploadIdeaTemplate"
            size="lg"
            :style="{
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }"
            :loading="isLoading"
            @click="toggleContentUploadSelector()"
          >
            <i
              class="ri-file-download-line"
              style="margin-top: 2px"
              v-if="!isLoading"
            ></i>
          </loading-button>

          <idea-edit-select-upload
            v-if="contentTypeSelectorUpload"
            @processFile="processFileToEditor"
          />
        </div>
      </div>

      <div
        class="idea_edit_content_container_content-header-button"
        :style="{ 'z-index': contentTypeSelectorVisible ? 1 : 0 }"
      >
        <div v-if="!idea.id">
          <b-popover
            target="idea_content_type_info_info_text-info"
            triggers="hover"
            placement="top"
            boundary="window"
          >
            <div class="idea_content-type_disabled-info_text">
              {{ $t("You must save idea before editing templates") }}
            </div>
          </b-popover>

          <div
            id="idea_content_type_info_info_text-info"
            class="idea_content_type_info_info_text-info"
          >
            <i class="mdi mdi-information idea_content_type_info_info_icon"></i>
          </div>
        </div>
        <loading-button
          :disabled="vErrors.any() || isLoading || !idea.id"
          variant="primary"
          id="idea_edit_content_btnNewIdeaTemplate"
          size="lg"
          :style="{
            cursor: isLoading || !idea.id ? 'not-allowed' : 'pointer',
          }"
          :loading="isLoading"
          @click="toggleContentTypeSelector()"
        >
          <div v-if="!isLoading">
            {{ getContentName || $t("unnamed_type") }}
          </div>
        </loading-button>

        <idea-edit-select-type
          v-if="contentTypeSelectorVisible"
          :primary="getPrimaryContentType"
          :categories="getIdeaContentCategories"
          :comments="comments"
          :selected="selectedCategoryIndex"
          @expand="editContentType"
          @select="changeContentType"
          @create="createContentType"
        />

        <idea-edit-type
          v-show="editContentItem"
          :visible="contentTypeSelectorForm"
          :categories="getIdeaContentCategories"
          :primary="getPrimaryContentType"
          :isLoading="isLoading"
          v-model="editContentItem"
          @save="save"
          @remove="remove"
          @close="closeContentTypeSelectorForm"
        />
      </div>
    </div>

    <idea-content-editor
      ref="editorContainer"
      :isEditable="isEditable && isInitialized"
      :isRefreshing="isSaving || isLoading"
      :isInitialized="isInitialized"
      v-model="getIdeaContent"
      :idea="idea"
      @fileAdded="setFile"
      @fileRemoved="removeFile"
      @saveContent="saveContent"
      @initialized="setIsInitialized"
      @contentWindowTop="setContentWindowTop"
      :contentWindowTop="contentWindowTop"
      :contentType="contentType"
    />
  </div>
</template>

	<script>
import ideaContentEditor from "../editor/IdeaContentEditor.vue";
import ideaEditType from "./IdeaEditType";
import ideaEditSelectType from "./IdeaEditSelectType";
import ideaEditSelectUpload from "./ideaEditSelectUpload";
import GQLForm from "@/lib/gqlform";
import empty from "./templates/empty.json";

export default {
  components: {
    "idea-content-editor": ideaContentEditor,
    "idea-edit-type": ideaEditType,
    "idea-edit-select-type": ideaEditSelectType,
    "idea-edit-select-upload": ideaEditSelectUpload,
  },
  props: {
    idea: {
      type: Object,
      required: false,
    },
    value: {
      type: Object,
      required: false,
    },
    isLoading: {
      type: Boolean,
      default: true,
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    selectedCategoryIndex: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    ideaContentCategories: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {

    getIdeaContentCategories: {
      get() {
        return this.ideaContentCategories.map(
          (category) => category.contentForm
        );
      },
    },

    getPrimaryContentType: {
      get() {
        let primaryForm = this.ideaContentCategories.find(
          (category) => category.isPrimary
        );

        if (!primaryForm) {
          primaryForm =
            this.ideaContentCategories.find(
              (content) => content.contentForm.id == this.idea.ideaContentId
            ) || this.ideaContentCategories[0];
        }
        return primaryForm ? primaryForm.contentForm : {};
      },
    },

    getContentName: {
      get() {
        let name = "";
        if (this.ideaContentCategories.length > 0) {
          const form = this.ideaContentCategories[this.selectedCategoryIndex];
          name = form.contentForm.contentType;
        }
        return name;
      },
      set(value) {
        this.$emit("contentType");
      },
    },
    getIdeaContent: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
        if (this.isInitialized && this.isEditable) {
          this.$emit("isDirty");
        }
      },
    },
  },
  data: () => ({
    contentTypeSelectorVisible: false,
    contentTypeSelectorForm: false,
    contentTypeSelectorUpload: false,
    contentType: "Custom",
    selectingType: false,
    isEditable: false,
    isInitialized: false,
    newType: "",
    contentWindowTop: null,
    editContentItem: null,
  }),
  methods: {
    toggleContentUploadSelector() {
      this.contentTypeSelectorUpload = !this.contentTypeSelectorUpload;
    },
    closeContentTypeSelectorForm() {
      this.contentTypeSelectorForm = false;
      this.editContentItem = null;
    },
    save() {
      this.$emit("saveIdeaContentArea", this.editContentItem);

      setTimeout(() => {
        if (!this.editContentItem.id) {
          this.contentTypeSelectorForm = false;
        }
      }, 500);
    },
    remove() {
      if (this.editContentItem.isPrimary) {
        window.vm.$snotify.error(
          this.$t("you must appoint another home page before remove"),
          {
            timeout: 5000,
            showProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
          }
        );
      } else {
        this.$emit("removeIdeaContentArea", this.editContentItem);
        this.contentTypeSelectorForm = false;
      }
      //
    },
    editContentType(item) {
      this.contentTypeSelectorForm = false;
      setTimeout(() => {
        this.editContentItem = new GQLForm({
          id: item.id,
          markup: item.markup,
          version: item.version,
          isPrimary: item.isPrimary,
          name: item.contentType,
          ideaId: item.ideaId,
          companyRoles: item.companyRoles,
        });
        this.contentTypeSelectorForm = true;
      }, 200);
    },
    toggleContentTypeSelector() {
      this.contentTypeSelectorForm = false;
      this.contentTypeSelectorVisible = !this.contentTypeSelectorVisible;
    },
    createContentType() {
      this.editContentItem = null;
      this.contentTypeSelectorForm = true;
      this.contentTypeSelectorVisible = true;
      setTimeout(() => {
        this.editContentItem = new GQLForm({
          id: undefined,
          markup: {
            title: "Empty",
            content: JSON.stringify(empty),
          },
          version: 1,
          isPrimary: false,
          name: null,
          ideaId: this.idea.id,
          companyRoles: [],
        });
      }, 100);
    },
    changeContentType(item) {
      this.$emit("changeType", item);
      this.$nextTick(() => {
        this.contentTypeSelectorForm = false;
      });
    },

    closeContentType() {
      this.closeContentTypeSelectorForm();
      this.contentTypeSelectorUpload = false;
      this.contentTypeSelectorVisible = false;
    },
    setContentWindowTop(scrollTop) {
      this.contentWindowTop = scrollTop;
    },

    setIsInitialized(editor) {
      this.isEditable = true;
      this.isInitialized = true;

      this.$emit("editorLoaded", editor);
    },
    saveContent(reloadContent) {
      this.$emit("saveIdeaContent", reloadContent);
    },
    setFile(file) {
      this.$emit("fileAdded", file);
    },
    removeFile(file) {
      this.$emit("fileRemoved", file);
    },
    processFileToEditor(file) {
      const editor = this.$refs["editorContainer"]?.editor;

      if (editor) {
        editor.commands.setInlineFile(file);
      }

      this.contentTypeSelectorUpload = false;
    },
  },
};
</script>


<style lang="scss">
.idea-template-select-item.is-active {
  background: #f8f8f8;
  color: #fff;
}

.idea-template-select-item:hover {
  background: lightgray;
  color: #fff;
}

.idea-template-create-item {
  display: flex;
  justify-content: space-between;
}
.idea-template-create-item > input {
  height: 30px;
  max-width: 60%;
  border: none;
  border-bottom: 1px solid lightgray;
}
.selectedIdeaContentType {
  min-width: 100px;
}

.idea-template-select-item-action {
  width: 30px;
  height: 30px;
  display: flex;
  place-content: center;
  border-radius: 50%;
}

.idea-template-select-item {
  height: 30px;
  align-items: center;
  justify-content: space-between;
  display: flex;
  font-size: 16px;
  width: 100%;
  padding-left: 10px;
  cursor: pointer;
}

.selectedIdeaContentType button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.idea_edit_content_container_content-header {
  display: flex;
  height: 81px;
  background: #fff;
  justify-content: space-between;
  align-items: center;
}

.idea_edit_content_container_content-header-title {
  height: 60px;
  padding: 20px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
}

.idea_edit_content_container_content-header-upload {
  margin-left: 10px;
  & > #idea_edit_content_btnUploadIdeaTemplate {
    border-radius: 3px;
    border: none;
    background: #fff;
    &:hover:not(:disabled) {
      color: #fff;
      background: #4294d0 !important;
      border-color: #4294d0;
    }
  }
}

.idea_edit_content_container_content-header-button {
  margin: 7px 20px;
  border-radius: 3px;
  font-size: 16px;
  white-space: nowrap;
  flex-direction: row;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 5px;
  min-height: 40px;

  > #idea_edit_content_btnNewIdeaTemplate {
    width: 120px;
    min-height: 40px;
    &:hover:not(:disabled) {
      color: #fff;
      background: #4294d0 !important;
      border-color: #4294d0;
    }

    > div {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.idea_edit_content_container {
  margin: 20px;
  border-radius: 3px;
  width: 75%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.idea_content_type_info_info_text-info {
  margin-right: 10px;
  cursor: pointer;
  & > .idea_content_type_info_info_icon {
    color: #4294d0;
    padding-left: 3px;
    font-size: 26px;
    padding-right: 3px;
  }
}
.idea_content_type_info_info_text-info > .popover {
  padding: 5px;
  max-width: 250px;
}

.idea_content-type_disabled-info_text {
  padding: 10px;
  font-size: 14px;
}
</style>
