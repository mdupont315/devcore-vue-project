<template>
  <div class="editable-table-cell">
    <slot v-if="!editing">
      <span v-if="staticValue">{{ staticValue }}</span>
    </slot>
    <slot v-if="editing" name="editing" :editing="editing">
      <b-input v-model="item[property]" size="sm" v-bind="$attrs" @input="input"></b-input>
    </slot>
  </div>
</template>
<script>
export default {
  name: "TableEditableCell",
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