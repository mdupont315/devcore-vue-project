<template>
  <super-select
    :items="tools"
    class="image-selector display-selector"
		style="z-index:0"
    selector-class="columns columns-3"
    v-model="dataValue"
    :v-bind="$props"
    ref="selector"
    :placeholder="placeholder"
    v-if="ready"
    :state="state"
    :outside-close="!showPopOver"
    :show-input="showInput"
    :filter-fn="filter"
    @input="change"
    :show-add-btn="showAddBtn"
    :max-display-items="5"
    @close="close"
    :key="intent"
  >
    <template slot="selection-count" slot-scope="props">{{
      $tc("tool.count", props.values.length)
    }}</template>
    <template slot="dropdown-item" slot-scope="props">
      <div class="text-center">
        <img
          :src="props.item.getAvatarUrl('50x50')"
          class="rounded-circle d-block mx-auto img"
          height="40"
        />
        <span class="break-word"> {{ props.item.name }}</span>
      </div>
    </template>
    <template slot="header-display">
      <div class="stacked-avatars single-line">
        <div
          v-for="item in selectedItems.slice(0, maxDisplayItems)"
          :key="item.id"
          v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
          class="avatar-item"
          :title="item.name"
        >
          <img :src="item.getAvatarUrl('50x50')" height="22" />
        </div>
      </div>
    </template>
    <template slot="display-details" slot-scope="props">
      <ul v-if="props.items" class="list-unstyled">
        <li v-for="item in selectedItems" :key="item.id" class="my-1">
          <img
            class="border rounded-circle"
            :src="item.getAvatarUrl('50x50')"
            height="30"
          />
          {{ item.name }}
          <b-button
            class="
              float-right
              btn-white btn-outline-danger btn-xs
              border-0
              text-danger
            "
            @click.stop="removeItem(item, $event)"
          >
            <i class="mdi mdi-delete"></i>
          </b-button>
        </li>
      </ul>
    </template>
    <template slot="footer-display">
      <div v-if="showFooterSelection" class="stacked-avatars single-line">
        <div
          v-for="item in selectedItems.slice(0, maxDisplayItems)"
          :key="item.id"
          v-b-tooltip="{ placement: 'bottom', boundary: 'viewport' }"
          class="avatar-item"
          :title="item.fullName"
        >
          <img
            :src="item.getAvatarUrl('50x50')"
            height="22"
            @click="removeItem(item, $event)"
          />
        </div>
      </div>
    </template>
  </super-select>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "IdeaToolSelector",
  props: {
    items: {
      required: false,
      type: Array,
    },
    placeholder: {
      required: false,
      default: () => null,
    },
    value: {
      required: false,
    },
    state: {
      required: false,
    },
    showAddBtn: {
      required: false,
      default: () => true,
    },
    showInput: {
      required: false,
      default: () => true,
    },
    showFooterSelection: {
      required: false,
      default: () => true,
    },
  },
  $_veeValidate: {
    // fetch the current value from the innerValue defined in the component data.
    name() {
      return this.name;
    },
    value() {
      return this.value;
    },
  },
  data: () => ({
    showPopOver: false,
    dataValue: [],
    ready: false,
    maxDisplayItems: 6,
    intent: Math.random(),
  }),
  computed: {
    ...mapGetters({
      allTools: "companyTool/all",
    }),
    tools: {
      get() {
        return (this.items || this.allTools).sort((a, b) =>
          a.name > b.name ? 1 : -1
        );
      },
    },

    selectedItems: {
      get() {
        return this.tools
          .filter((r) => this.dataValue.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      },
    },
  },
  mounted() {
    if (this.value) {
      if (this.value.length > 0) {
        const tools = this.value.filter(
          (o) => this.tools.find((u) => u.id === o) != null
        );
        this.dataValue = tools;
      } else {
        this.dataValue = [];
      }
    }

    this.ready = true;
    this.intent = Math.random();
  },
  methods: {
    removeItem(item, event) {
      event.stopPropagation();
      if (item) {
        this.dataValue = this.dataValue.filter((i) => i !== item.id);
        this.$refs.selector.setDataValue(this.dataValue);
        this.$emit("input", this.dataValue);
      }
    },
    change(value, event) {
			console.log(value, event)
      this.dataValue = value;
      this.$emit("input", this.dataValue, event);
    },
    itemAdded(item) {
      this.$refs.selector.toggleItem(item);
    },
    togglePopOver() {
      this.showPopOver = !this.showPopOver;
    },
    close() {
      this.showPopOver = false;
      this.$emit("close");
    },
    async filter(value, event) {
      if (event) {
        event.stopPropagation();
      }
      let ret = this.tools;
      if (value) {
        ret = this.tools.filter(
          (i) =>
            i.fullName.toLowerCase().includes(value.toLowerCase()) ||
            (i.email
              ? i.email.toLowerCase().includes(value.toLowerCase())
              : false)
        );
      }
      return ret;
    },
  },
};
</script>
