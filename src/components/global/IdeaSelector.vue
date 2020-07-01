<template>
  <super-select
    :items="ideas"
    class="text-selector"
    @input="change"
    selector-class="list"
    :v-bind="$props"
    :placeholder="$t('Ideas')"
    :state="state"
    :outside-close="!showPopOver"
    v-model="dataValue"
    ref="selector"
    v-if="ready"
    :show-input="showInput"
    :show-footer-selection="false"
    :filterFn="filter"
    :show-add-btn="showAddBtn"
    :maxDisplayItems="1"
    @close="close"
  >
    <template slot="selection-count" slot-scope="props">{{ $tc('idea.count', props.values.length) }}</template>
    <template slot="dropdown-item" slot-scope="props">
      <div class="text-left">
        <span class="break-word">
          {{ props.item.title }}
          <small class="text-capitalize">{{ $t(props.item.status) }}</small>
        </span>
      </div>
    </template>
    <template slot="header-display">
      <div class="selected-item" v-if="selectedItems && selectedItems.length>0">
        <div
          class="text-overflow"
          v-for="item in selectedItems.slice(0,maxDisplayItems)"
          :key="item.id"
          v-b-tooltip="{  placement: 'top', boundary:'viewport' }"
          :title="item.title"
        >{{ item.title }}</div>
      </div>
    </template>
    <template slot="header-display-overflow">
      <span
        class="overflow"
        v-if="selectedItems.length>maxDisplayItems"
      >{{ selectedItems && selectedItems.length>maxDisplayItems?'+'+(selectedItems.length - maxDisplayItems ):null }}</span>
    </template>
    <template slot="display-details" slot-scope="props">
      <ul class="list-unstyled" v-if="props.items">
        <li v-for="item in selectedItems" :key="item.id" class="my-1 row">
          <span class="col-10 text-overflow">{{ item.title }} {{ item.status }}</span>
          <b-button
            class="col-2 btn-white btn-outline-danger btn-xs border-0 text-danger"
            @click.stop="removeItem(item, $event)"
          >
            <i class="mdi mdi-delete"></i>
          </b-button>
        </li>
      </ul>
    </template>
  </super-select>
</template>
<script>
import { /*mapState,*/ mapGetters } from "vuex";
export default {
  name: "idea-selector",
  props: {
    items: {
      required: false,
      type: Array
    },
    value: {
      required: false,
      default: () => []
    },
    state: {
      required: false
    },
    showAddBtn: {
      required: false,
      default: () => true
    },
    showInput: {
      required: false,
      default: () => true
    },
    showFooterSelection: {
      required: false,
      default: () => false
    }
  },
  $_veeValidate: {
    // fetch the current value from the innerValue defined in the component data.
    name() {
      return this.title;
    },
    value() {
      return this.value;
    }
  },
  // watch:{
  //   ideas:function(oldValue, newValue){
  //     console.log("Changed", newValue);
  //   }
  // },
  data: () => ({
    showPopOver: false,
    dataValue: [],
    ready: false,
    maxDisplayItems: 1
  }),
  computed: {
    ...mapGetters({
      allIdeas: "idea/all"
    }),
    ideas: {
      get() {
        return (this.items || this.allIdeas).sort((a, b) =>
          a.title > b.title ? 1 : -1
        );
      }
    },
    selectedItems: {
      get() {
        return this.ideas
          .filter(r => this.dataValue.includes(r.id))
          .sort((a, b) => (a.title > b.title ? 1 : -1));
      }
    }
  },
  async mounted() {
    if (!this.items) {
      await this.$store.dispatch("idea/findAll");
    }
    if (this.value) {
      this.dataValue = this.value.filter(
        o => this.ideas.find(u => u.id === o) != null
      );
    } else {
      this.dataValue = [];
    }
    this.ready = true;
  },
  methods: {
    removeItem(item, event) {
      event.stopPropagation();
      if (item) {
        this.dataValue = this.dataValue.filter(i => i !== item.id);
        this.$refs.selector.setDataValue(this.dataValue);
        this.$emit("input", this.dataValue);
      }
    },
    change(value, event) {
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
      let ret = this.ideas;
      if (value) {
        ret = this.ideas.filter(i =>
          i.title.toLowerCase().includes(value.toLowerCase())
        );
      }
      return ret;
    }
  }
};
</script>