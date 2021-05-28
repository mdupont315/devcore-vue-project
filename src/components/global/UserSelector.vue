<template>
  <super-select
    :items="users"
    class="image-selector"
    selector-class="columns columns-3"
    v-model="dataValue"
    :v-bind="$props"
    ref="selector"
    :placeholder="$t('Users')"
    v-if="ready"
    :state="state"
    :outside-close="!showPopOver"
    :show-input="showInput"
    :filter-fn="filter"
    @input="change"
    :show-add-btn="showAddBtn"
    :max-display-items="6"
    @close="close"
  >
    <template slot="selection-count" slot-scope="props">{{ $tc('user.count', props.values.length) }}</template>
    <template slot="dropdown-item" slot-scope="props">
      <div class="text-center">
        <img
          :src="props.item.getAvatarUrl('50x50')"
          class="rounded-circle d-block mx-auto img"
          height="40"
        />
        <span class="break-word">{{ props.item.fullName }}</span>
      </div>
    </template>
    <template slot="header-display">
      <div class="stacked-avatars single-line">
        <div
          v-for="item in selectedItems.slice(0,maxDisplayItems)"
          :key="item.id"
          v-b-tooltip="{  placement: 'top', boundary:'viewport' }"
          class="avatar-item"
          :title="item.fullName"
        >
          <img :src="item.getAvatarUrl('50x50')" height="22" />
        </div>
      </div>
    </template>
    <template slot="display-details" slot-scope="props">
      <ul v-if="props.items" class="list-unstyled">
        <li v-for="item in selectedItems" :key="item.id" class="my-1">
          <img class="border rounded-circle" :src="item.getAvatarUrl('50x50')" height="30" />
          {{ item.fullName }}
          <b-button
            class="float-right btn-white btn-outline-danger btn-xs border-0 text-danger"
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
          v-for="item in selectedItems.slice(0,maxDisplayItems)"
          :key="item.id"
          v-b-tooltip="{  placement: 'bottom', boundary:'viewport' }"
          class="avatar-item"
          :title="item.fullName"
        >
          <img :src="item.getAvatarUrl('50x50')" height="22" @click="removeItem(item, $event)" />
        </div>
      </div>
    </template>
  </super-select>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";

export default {
  name: "UserSelector",
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
      default: () => true
    }
  },
  $_veeValidate: {
    // fetch the current value from the innerValue defined in the component data.
    name() {
      return this.name;
    },
    value() {
      return this.value;
    }
  },
  data: () => ({
    showPopOver: false,
    dataValue: [],
    ready: false,
    maxDisplayItems: 6
  }),
  computed: {
    ...mapGetters({
      allUsers: "user/all"
    }),
    users: {
      get() {
        return (this.items || this.allUsers).sort((a, b) =>
          a.firstName > b.firstName ? 1 : -1
        );
      }
    },
    selectedItems: {
      get() {
        return this.users
          .filter(r => this.dataValue.includes(r.id))
          .sort((a, b) => (a.fullName > b.fullName ? 1 : -1));
      }
    }
  },
  async mounted() {
    await this.$store.dispatch("user/findAll");
    if (this.value) {
      this.dataValue = this.value.filter(
        o => this.users.find(u => u.id === o) != null
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
      let ret = this.users;
      if (value) {
        ret = this.users.filter(
          i =>
            i.fullName.toLowerCase().includes(value.toLowerCase()) ||
            (i.email
              ? i.email.toLowerCase().includes(value.toLowerCase())
              : false)
        );
      }
      return ret;
    }
  }
};
</script>
