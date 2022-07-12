<template>
  <div class="idea_edit_content_container">
    <div class="idea_edit_content_container_content-header">
      <div class="idea_edit_content_container_content-header-title">
        {{
          idea.title ? idea.title : $t("action.create", { name: $t("idea") })
        }}
      </div>
      <div class="idea_edit_content_container_content-header-button">
        <b-button
          v-show="false"
          ref="btnNewIdeaTemplate"
          style="overflow: hidden; min-width: 100px"
        >
          <span v-if="!isLoading">{{
            ideaContentCategories[selectedCategoryIndex].name
          }}</span>
          <b-spinner v-else style="width: 15px; height: 15px" />
        </b-button>

        <b-popover
          ref="popover"
          :target="() => $refs.btnNewIdeaTemplate"
          placement="bottom"
          class="idea-template-select"
          triggers="click blur"
        >
          <b-card no-body style="width: 100px">
            <b-card-body style="padding: 0">
              <div>
                <div
                  v-for="(item, index) in ideaContentCategories"
                  :key="index"
                  class="idea-template-select-item"
                  :class="{
                    'is-active': getIdeaContent.contentType === item.name,
                  }"
                  style="color: #4294d0"
                  @click="changeContentType(item)"
                >
                  {{ item.name }}
                </div>
              </div>
              <!-- <div>
                <div class="idea-template-create-item">
                  <b-form-input
                    v-model="newType"
                    placeholder="Create + "
                  ></b-form-input>
                  <b-button
                    id="btnNew"
                    v-b-tooltip.hover
                    size="sm"
                    class="text-uppercase idea-template-select-item-action"
                    variant="primary"
                    :title="$t('Create New') + ' ' + $t('Idea Template')"
                    @click="addNewIdeaTemplate"
                  >
                    <i class="mdi mdi-plus"></i>
                  </b-button>
                </div>
              </div> -->
            </b-card-body>
          </b-card>
        </b-popover>
      </div>
    </div>

    <idea-content-editor
      v-if="!isLoading"
      :isEditable="isEditable"
      v-model="getIdeaContent"
      :idea="idea"
      :isSaving="isSaving"
      @fileAdded="setFile"
      @fileRemoved="removeFile"
      @saveContent="saveContent"
      @initialized="setIsInitialized"
      @contentScrollPosition="setContentScrollPosition"
      :scrollToSelection="contentScrollPosition"
      :contentType="contentType"
    />
    <div v-else class="ideaContent-empty-spinner">
      <b-spinner />
    </div>
  </div>
</template>

	<script>
import ideaContentEditor from "../editor/IdeaContentEditor.vue";

export default {
  components: {
    "idea-content-editor": ideaContentEditor,
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
    ideaContentCategories: {
      type: Array,
      required: true,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: true,
    },
    isSaving: {
      type: Boolean,
      default: true,
    },

    selectedCategoryIndex: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    getIdeaContent: {
      get() {
        return {
          contentType:
            this.ideaContentCategories[this.selectedCategoryIndex].name,
          markup: this.value.markup,
        };
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
    contentType: "Custom",
    selectingType: false,
    isEditable: false,
    isInitialized: false,
    newType: "",
    contentScrollPosition: null,
  }),
  methods: {
    setContentScrollPosition(val) {
      this.contentScrollPosition = val;
    },
    setIsInitialized() {
      this.isEditable = true;
      this.isInitialized = true;

			this.$emit("editorLoaded")
    },
    saveContent(reloadContent) {
			console.log(reloadContent)
      this.$emit("saveIdeaContent", reloadContent);
    },
    setFile(file) {
      this.$emit("fileAdded", file);
    },
    removeFile(file) {
      this.$emit("fileRemoved", file);
    },
    changeContentType(item) {
      this.$emit("selectedType", item);
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

.ideaContent-empty-spinner {
  text-align: center;
  height: 100%;
  border-radius: 3px;
  display: flex;
  place-content: center;
  align-items: center;
  background: #fff;
  width: 100%;
  & > span {
    width: 40px;
    margin-bottom: 100px;
    color: lightgray;
    height: 40px;
    background: #fff;
  }
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
  background: #fff;
  justify-content: space-between;
  align-items: center;
}

.idea_edit_content_container_content-header-title {
  height: 60px;
  padding: 20px;
  font-size: 16px;
}

.idea_edit_content_container_content-header-button {
  margin: 20px 20px 10px 20px;
}
.idea_edit_content_container {
  margin: 20px;
  border-radius: 3px;
  width: 75%;
  overflow: hidden;
}
</style>
