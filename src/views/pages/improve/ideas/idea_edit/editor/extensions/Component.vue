<template>
  <node-view-wrapper class="vue-component">
    <span class="label-test">Vue Component</span>

    <div class="content-test">
      <button @click="increase">
        This button has been clicked {{ node.attrs.count }} times.
      </button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  methods: {
    increase() {
      this.updateAttributes({
        count: this.node.attrs.count + 1,
      })
    },
  },
}
</script>

<style lang="scss">
.vue-component {
  background: #FAF594;
  border: 3px solid #0D0D0D;
  border-radius: 0.5rem;
  margin: 1rem 0;
  position: relative;
}

.label-test {
  margin-left: 1rem;
  background-color: #0D0D0D;
  font-size: 0.6rem;
  letter-spacing: 1px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  position: absolute;
  top: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 0 0 0.5rem 0.5rem;
}

.content-test {
  margin-top: 1.5rem;
  padding: 1rem;
}
</style>
