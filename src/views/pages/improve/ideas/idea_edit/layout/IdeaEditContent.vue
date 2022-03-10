<template>
  <div class="idea_edit_content_container">
    <div class="idea_edit_content_container_content-header">
      <div>Instruction content</div>
      <div>
        <b-button
          ref="btnNewIdeaTemplate"
          style="overflow: hidden; min-width: 100px"
        >
          {{ selectedType }}</b-button
        >
        <b-popover
          ref="popover"
          :target="() => $refs.btnNewIdeaTemplate"
          placement="bottom"
          class="idea-template-select"
          triggers="click"
        >
          <b-card no-body style="width: 150px">
            <b-card-body>
              <div>
                <div
                  v-for="(item, index) in ideaContentTypes"
                  :key="index"
                  class="idea-template-select-item"
                  style="color: #4294d0"
                  @click="setTypeActive(item)"
                >
                  {{ item.name }}
                </div>
              </div>
              <div>
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
              </div>
            </b-card-body>
          </b-card>
        </b-popover>
      </div>
    </div>
    <idea-content-editor v-model="getIdeaContent" :idea="idea" :contentType="selectedType" />
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
    user: {
      type: Object,
      required: false,
    },
    value: {
      type: Object,
      required: false,
    },
  },
  computed: {
    getIdeaContent: {
      get() {
        return this.value;
      },
      set(value) {
				this.$emit("input", value)
      },
    },
  },
  data: () => ({
    selectedType: "Cheatsheet",
    selectingType: false,
    newType: "",
    ideaContentTypes: [
      { name: "Cheatsheet" },
      { name: "Learn" },
      { name: "Custom" },
    ],
  }),
  methods: {
    setTypeActive(item) {
      this.selectedType = item.name;
    },
    addNewIdeaTemplate() {
      if (!this.newType) return;
      this.ideaContentTypes.push({ name: this.newType });
    },
  },
};
</script>


<style lang="scss">
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
}

.selectedIdeaContentType button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.idea_edit_content_container_content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 20px;
  font-size: 20px;
}
.idea_edit_content_container {
  background: #fff;
  flex-grow: 3;
  border-radius: 5px;
  width: 75%;
}
</style>
