<template>
  <div class="idea_edit_container">
    <idea-edit-content
      :user="user"
      :idea="idea"
      v-model="getIdeaContent"
    ></idea-edit-content>
    <idea-edit-path
      @close="closeIdeaEdit"
      @save="saveIdea"
      :idea="idea"
    ></idea-edit-path>
  </div>
</template>

	<script>
import IdeaEditContent from "./layout/IdeaEditContent.vue";
import IdeaEditPath from "./layout/IdeaEditPath.vue";

export default {
  components: {
    "idea-edit-content": IdeaEditContent,
    "idea-edit-path": IdeaEditPath,
  },
  data: () => ({
    ideaContent: null,
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
    getIdeaContent: {
      get() {
        return this.ideaContent;
      },
      set(value) {
        this.ideaContent = value;
      },
    },
  },
  methods: {
    async saveIdea(form) {
      await this.$store.dispatch("idea/create", form);
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
  margin-left: 15px;
  margin-top: 0px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
