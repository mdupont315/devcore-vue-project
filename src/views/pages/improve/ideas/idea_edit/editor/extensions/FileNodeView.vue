<template>
  <node-view-wrapper as="div" class="file-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-file">
      <div
        v-if="getAttrs.preview"
        style="display: flex; flex-direction: column"
      >
        <div style="margin-right: 5px; margin-bottom: 10px">
          <img
            :src="getAttrs.src"
            :alt="getAttrs.title"
            style="width: 100%; height: 100%"
          />
        </div>
        <button @click="remove" class="file-remove-button">
          {{ $t("Remove") }}
        </button>
      </div>

      <div v-else style="display: flex">
        <div style="margin-right: 5px; margin-bottom: 10px">
          <a :href="getAttrs.href"> {{ getAttrs.title }}</a>
        </div>
        <div>
          <span>
            <button @click="remove" class="file-remove-button">
              {{ $t("Remove") }}
            </button>
          </span>
        </div>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  content: "inline*",

  computed: {
    fileEntity() {
      const stringFileEntity = this.node?.attrs;
      return stringFileEntity;
    },
    getAttrs() {
      return this.fileEntity;
    },
  },
  beforeDestroy() {
		console.log("DESTROYED")
		console.log(this.fileEntity)
    this.editor.commands.removeFile(this.fileEntity);
  },
  methods: {
    remove() {
      const { editor, getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      editor.commands.deleteRange({ from, to });
    },
  },
};
</script>

<style lang="scss">
.file-component {
  .file-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 60px;
    height: 20px;
    position: relative;
    border-radius: 3px;
    background: #fff;
    bottom: 2px;
    &:hover {
      background: #d0424d;
      color: #fff;
    }
  }
  .file-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
  }
}
</style>
