<template>
  <div class="idea_edit_container">
    <idea-edit-content :user="user" :idea="idea"></idea-edit-content>
    <idea-edit-path @close="closeIdeaEdit" :idea="idea"></idea-edit-path>
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
	margin-top:0px;
  min-height: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
