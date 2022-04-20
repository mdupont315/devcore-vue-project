<template>
  <node-view-wrapper as="div" class="video-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-video">
      <div style="display: flex" v-if="videoEntity">
        <iframe
          :src="this.node.attrs.src"
          :title="this.node.attrs.title"
          :frameborder="this.node.attrs.frameborder"
          :allow="this.node.attrs.allow"
          :allowfullscreen="this.node.attrs.allowfullscreen"
        ></iframe>

        <button @click="remove" class="video-remove-button">
          {{ $t("Remove") }}
        </button>
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
    videoEntity() {
      const stringFileEntity = this.node?.attrs;
      console.log(this.node);
      return stringFileEntity;
    },
    getAttrs() {
      return this.videoEntity;
    },
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
.video-component {
  .video-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 60px;
    height: 20px;
    right: -15px;
    position: relative;
    border-radius: 3px;
    background: #fff;
    transform: translate(-2px, -10px);
  }
  .video-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
    transform: translate(-8px, -8px);
  }
}
</style>
