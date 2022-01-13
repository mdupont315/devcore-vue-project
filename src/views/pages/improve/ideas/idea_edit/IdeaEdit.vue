<template>
  <div class="idea_edit_container">
    <idea-edit-content></idea-edit-content>
    <idea-edit-path @close="closeIdeaEdit"></idea-edit-path>
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
  methods: {
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
  margin: 20px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
