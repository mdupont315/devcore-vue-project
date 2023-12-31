<template>
  <super-select
    :items="roles"
    class="image-selector"
    selector-class="columns columns-3"
    v-model="dataValue"
    :v-bind="$props"
    ref="selector"
    :placeholder="$t('Roles')"
    v-if="ready"
    :state="state"
    :outside-close="!showPopOver"
    :show-input="showInput"
    :show-footer-display="showFooterSelection"
    @input="change"
    :show-add-btn="showAddBtn"
    :filter-fn="filter"
    @close="close"
  >
    <template slot="selection-count" slot-scope="props">{{
      $tc("role.count", props.values.length)
    }}</template>
    <template slot="dropdown-item" slot-scope="props">
      <div class="text-center">
        <img
          :src="props.item.getAvatarUrl('50x50')"
          class="rounded-circle d-block mx-auto img"
          height="40"
        />
        <span class="break-word">{{ props.item.name }}</span>
      </div>
    </template>
    <template slot="header-display">
      <div class="stacked-avatars single-line">
        <div
          v-for="item in selectedItems"
          :key="item.id"
          v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
          class="avatar-item"
          :title="item.name"
        >
          <img
            :src="item.getAvatarUrl('50x50')"
            height="22"
            @click="removeItem(item, $event)"
          />
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
          v-for="item in selectedItems"
          :key="item.id"
          v-b-tooltip="{ placement: 'bottom', boundary: 'viewport' }"
          class="avatar-item"
          :title="item.name"
        >
          <img
            :src="item.getAvatarUrl('50x50')"
            height="22"
            @click="removeItem(item, $event)"
          />
        </div>
      </div>
    </template>
    <template slot="footer-add-btn">
      <b-button
        ref="btnNewRole"
        style="z-index: 2; position: relative"
        @click="togglePopOver"
        >+ {{ $t("New") }}</b-button
      >
      <!-- <layer v-if="showPopOver" @closed="togglePopOver" style="z-index:3; position:relative"> -->
      <b-popover
        ref="popover"
        :target="() => $refs.btnNewRole"
        placement="bottom"
        class="form-popover"
        :show.sync="showPopOver"
      >
        <b-card no-body style="width: 320px">
          <b-card-body>
            <role-form @done="togglePopOver" @input="itemAdded"></role-form>
          </b-card-body>
        </b-card>
      </b-popover>
      <!-- </layer> -->
    </template>
  </super-select>
</template>
<script>
import { /* mapState, */ mapGetters } from "vuex";
import RoleForm from "@/views/pages/manage/company_role/Form";

export default {
  name: "CompanyRoleSelector",
  components: {
    "role-form": RoleForm,
  },
  props: {
    items: {
      required: false,
      type: Array,
    },
    value: {
      required: false,
      default: () => [],
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
  }),
  computed: {
    ...mapGetters({
      allRoles: "companyRole/all",
    }),
    roles: {
      get() {
        return (this.items || this.allRoles).sort((a, b) =>
          a.name > b.name ? 1 : -1
        );
      },
    },
    selectedItems: {
      get() {
        return this.roles
          .filter((r) => this.dataValue.includes(r.id))
          .sort((a, b) => (a.name > b.name ? 1 : -1));
      },
    },
  },
  async mounted() {
    await this.$store.dispatch("companyRole/findAll");
    if (this.value) {
      this.dataValue = this.value.filter(
        (o) => this.roles.find((u) => u.id === o) != null
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
        this.dataValue = this.dataValue.filter((i) => i !== item.id);
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
      let ret = this.roles;
      if (value) {
        ret = this.roles.filter((i) =>
          i.name.toLowerCase().includes(value.toLowerCase())
        );
      }
      return ret;
    },
  },
};
</script>
