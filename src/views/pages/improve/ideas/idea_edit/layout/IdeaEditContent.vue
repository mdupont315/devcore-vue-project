<template>
  <div class="idea_edit_content_container">
    <idea-editor />
  </div>
</template>

	<script>
import ideaEditor from "../editor/IdeaContentEditor.vue";
export default {
  components: {
    "idea-editor": ideaEditor,
  },
};
</script>


<style scoped>
.idea_edit_content_container {
  background: #fff;
  width: 100%;
  margin: 0 10px;
  padding: 20px;
  border-radius: 5px;
}
</style>
