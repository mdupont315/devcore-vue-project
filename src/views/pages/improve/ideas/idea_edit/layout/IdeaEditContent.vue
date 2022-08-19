<template>
  <div class="idea_edit_content_container">
    <div class="idea_edit_content_container_content-header">
      <div class="idea_edit_content_container_content-header-title">
        {{
          idea.title ? idea.title : $t("action.create", { name: $t("idea") })
        }}
      </div>

      <inner-overlay
        v-if="contentTypeSelectorVisible"
        @click="closeContentType()"
        style="z-index: 2"
      />

      <div class="idea_edit_content_container_content-header-button">
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
          :style="{ cursor: isLoading || !idea.id ? 'not-allowed' : 'pointer' }"
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
          :comments="getCommentsFromContent"
          :selected="selectedCategoryIndex"
          @expand="editContentType"
          @select="changeContentType"
          @create="createContentType"
        />

        <idea-edit-type
          v-if="editContentItem"
          :visible="contentTypeSelectorForm"
          :categories="getIdeaContentCategories"
          :primary="getPrimaryContentType"
          :isLoading="isLoading"
          v-model="editContentItem"
          @save="save"
          @remove="remove"
          @close="contentTypeSelectorForm = false"
        />
      </div>
    </div>

    <idea-content-editor
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
import GQLForm from "@/lib/gqlform";

export default {
  components: {
    "idea-content-editor": ideaContentEditor,
    "idea-edit-type": ideaEditType,
    "idea-edit-select-type": ideaEditSelectType,
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
    getCommentsFromContent: {
      get() {
        const improvementsCount = this.comments.filter(
          (comment) => comment.type === "IMPROVEMENT"
        ).length;
        const problemCount = this.comments.filter(
          (comment) => comment.type === "PROBLEM"
        ).length;
        return { improvementsCount, problemCount };
      },
    },
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
    contentType: "Custom",
    selectingType: false,
    isEditable: false,
    isInitialized: false,
    newType: "",
    contentWindowTop: null,
    editContentItem: null,
  }),
  methods: {
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
      console.log("created!");
      this.contentTypeSelectorForm = true;
      this.contentTypeSelectorVisible = true;
      this.editContentItem = new GQLForm({
        id: undefined,
        markup: null,
        version: 1,
        isPrimary: false,
        name: null,
        ideaId: this.idea.id,
        companyRoles: [],
      });
    },
    changeContentType(item) {
      this.$emit("changeType", item);
      this.$nextTick(() => {
        this.contentTypeSelectorForm = false;
      });
    },

    closeContentType() {
      this.contentTypeSelectorForm = false;
      this.contentTypeSelectorVisible = false;
    },
    setContentWindowTop(scrollTop) {
      this.contentWindowTop = scrollTop;
    },

    setIsInitialized() {
      this.isEditable = true;
      this.isInitialized = true;

      this.$emit("editorLoaded");
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
}

.idea_edit_content_container_content-header-button {
  margin: 10px 20px;
  border-radius: 3px;
  font-size: 16px;
  z-index: 2;
  white-space: nowrap;
  flex-direction: row;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 5px;
  min-height: 41px;

  > #idea_edit_content_btnNewIdeaTemplate {
    width: 120px;
    min-height: 41px;
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
