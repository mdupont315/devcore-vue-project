<template>
  <node-view-wrapper as="div" class="video-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-video">
      <div style="display: flex; flex-direction: column" v-if="videoEntity">
        <iframe
          :src="`${this.node.attrs.src}?rel=0`"
          :title="this.node.attrs.title"
          :frameborder="this.node.attrs.frameborder"
          :allow="this.node.attrs.allow"
          :allowfullscreen="this.node.attrs.allowfullscreen"
          :height="getHeight"
          :width="getWidth"
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
    getWidth() {
      const maxWidth = 560;
      const width =
        this.node.attrs.width >= maxWidth ? maxWidth : this.node.attrs.width;

      return width;
    },

    getHeight() {
      const maxHeight = 315;
      const height =
        this.node.attrs.height >= maxHeight
          ? maxHeight
          : this.node.attrs.height;
      return height;
    },
    videoEntity() {
      const stringFileEntity = this.node?.attrs;
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
    position: relative;
    border-radius: 3px;
    background: #fff;
		margin-top:10px;
		&:hover {
			background: #d0424d;
			color: #fff;
		}
  }
  .video-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
  }
}
</style>
