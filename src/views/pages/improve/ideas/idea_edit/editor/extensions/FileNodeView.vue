<template>
  <node-view-wrapper as="div" class="file-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-file">
      <div v-if="getAttrs.preview" style="display: flex">
        <div style="margin-right: 5px">
          <img :src="getAttrs.src" :alt="getAttrs.title" />
        </div>
        <button @click="remove" class="file-remove-button">Remove</button>
        <!-- <div>
          <img
            slot="reference"
            :class="`file-remove-icon`"
            :src="RemoveIcon"
            class="file-remove-icon"
            alt=""
            @click="remove"
          />
        </div> -->
      </div>

      <div v-else style="display: flex">
        <div style="margin-right: 5px">
          <a :href="getAttrs.src"> {{ getAttrs.title }}</a>
        </div>
        <div>
          <span>
            <button @click="remove" class="file-remove-button">Remove</button>
            <!-- <img
              slot="reference"
              :class="`file-remove-icon`"
              :src="RemoveIcon"
              class="file-remove-icon"
              alt=""
              @click="remove"
            /> -->
          </span>
        </div>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import { RemoveIcon } from "@/assets";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  data() {
    return {
      RemoveIcon,
    };
  },

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
  methods: {
    remove() {
      console.log("REMOVE");
      console.log(this);
      //	this.editor.commands.removeFile();
      console.log(this.node);
      const { editor, getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      editor.commands.deleteRange({ from, to });
      // const tr = this.view.state.tr;
      // console.log(tr);
      // const pos = this.getPos();
      // console.log(tr);
      // tr.delete(pos, pos + this.node.nodeSize);
      // this.view.dispatch(tr);
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
    right: -15px;
    position: relative;
    border-radius: 3px;
    background: #fff;
    transform: translate(-2px, -10px);
  }
  .file-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
    transform: translate(-8px, -8px);
  }
}
</style>
