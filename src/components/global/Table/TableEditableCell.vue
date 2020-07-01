<template>
  <div class="editable-table-cell">
    <slot v-if="!editing">
      <span v-if="staticValue">{{ staticValue }}</span>
    </slot>
    <slot name="editing" v-if="editing" v-bind:editing="editing">
      <b-input size="sm" v-bind="$attrs" v-model="item[property]" @input="input"></b-input>
    </slot>
  </div>
</template>
<script>
export default {
  name: "table-editable-cell",
  props: {
    staticValue: {
      required: false
    },
    item: {
      required: false
    },
    property: {
      required: false
    },
    validator: {
      required: false
    },
    row: {
      type: Object,
      required: true
    },
    editing: {
      type: Boolean,
      required: false,
      default: () => false
    }
  },
  data: () => ({
    dataValue: null
  }),
  mounted() {
    this.dataValue = this.value;
  },
  methods: {
    input(value) {
      this.$emit("input", value);
    }
  }
};
</script>