<template>
  <div class="idea_editor_content">
    <idea-editor />
  </div>
</template>

	<script>
import IdeaEditor from "./parts/Index.vue";
export default {
  components: {
    "idea-editor": IdeaEditor,
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
	height: 100%;
}
</style>
