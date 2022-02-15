<template>
  <node-view-wrapper class="dom" as="div">
    <node-view-content class="content-dom" as="table"/>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-2";
import { nodeViewProps } from "@tiptap/vue-2";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },
  mounted() {
    console.log("table");
    console.log(nodeViewProps);
  },
  props: {
    ...nodeViewProps,
  },
};
</script>

<style>
.test-class {
  background: red;
}
</style>
