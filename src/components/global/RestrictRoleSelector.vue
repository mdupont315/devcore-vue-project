<template>
  <div class="page" style="width: 300px; min-height: 50px">
    <b-card-header
      class="header"
      ref="editRolesPlaceholder"
      style="border: none"
    >
      <div class="advanced_evaluation_restriction" @click="toggleRolesPopover">
        <div class="advanced_evaluation_restriction-text">
          {{ labelText }}

          <b-popover
            :target="`advanced_restriction-${name}`"
            container="advanced_evaluation_restriction-text-info-id"
            placement="top"
            triggers="hover"
            :content="infoText"
            custom-class="advanced_restriction_popover"
          >
          </b-popover>

          <div
            class="advanced_evaluation_restriction-text-info"
            :id="`advanced_restriction-${name}`"
          >
            <i class="mdi mdi-information restriction-text-info-icon"></i>
          </div>
        </div>

        <div
          class="companyRoles"
          :class="{
            'advancedRoles-border-active': value.length > 0,
          }"
        >
          <div>
            <div
              class="stacked-avatars left"
              style="display: block; height: 30px"
            >
              <div v-if="value.length > 0">
                <div
                  v-for="role in value"
                  :key="role.id"
                  v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
                  class="avatar-item"
                  style="max-width: 20px; max-height: 20px; display: flex"
                  :title="role.name"
                >
                  <img :src="role.getAvatarUrl('50x50')" height="20" />
                </div>
              </div>
              <div v-else class="text-dark advanced-role-noroles">
                <b-button variant="primary" style="width: 100%">
                  {{ $t("NoRolesSelected") }}
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-card-header>
    <b-popover
      v-if="type === name"
      :key="intent"
      placement="right"
      :show="true"
      offset="10"
      :target="() => $refs.editRolesPlaceholder"
      custom-class="no-arrow transparent"
    >
      <b-card
        class="bg-light shadow-sm"
        no-body
        style="width: 210px; top: 20px"
      >
        <b-card-body style="min-height: 60px">
          <ul v-if="value.length > 0" class="list-inline break mb-0">
            <li
              v-for="role in value"
              :key="role.id"
              class="list-inline-item my-1 mx-1"
            >
              <img
                v-b-tooltip.hover
                :src="role.getAvatarUrl('50x50')"
                class="rounded rounded-circle border"
                height="30"
                :title="role.name"
              />
            </li>
          </ul>
          <div v-else class="text-dark">
            {{ $t("No") }} {{ $t("roles") }} {{ $t("selected") }}
          </div>
        </b-card-body>

        <b-card-footer class="mx-2">
          <b-button
            ref="btnAssignRoles"
            block
            variant="white"
            class="text-primary"
            size="md"
            @click="toggleRolesSelectPopover"
            >+ {{ $t("Assign roles") }}</b-button
          >
          <b-popover
            :target="() => $refs.btnAssignRoles"
            placement="bottom"
            custom-class="offset-t-5"
            :show.sync="showRolesSelectPopover"
          >
            <div style="width: 210px; overflow: hidden" class="rounded">
              <company-role-selector
                :key="intent"
                v-model="getValue"
                :items="items"
                selector-class="rounded"
                @input="saveSelection"
                :show-input="false"
                :show-footer-selection="false"
                :show-footer-display="false"
                :show-add-btn="$can('core/companyRole/create')"
                @close="toggleRolesSelectPopover"
              ></company-role-selector>
            </div>
          </b-popover>
        </b-card-footer>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
export default {
  data: () => ({
    showRolesSelectPopover: false,
    showRolesPopover: false,
    intent: 0,
  }),
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: () => "",
    },
    name: {
      type: String,
      default: () => "",
    },
    labelText: {
      type: String,
      default: () => "",
    },
    infoText: {
      type: String,
      default: () => "",
    },
  },
  computed: {
    getValue: {
      get() {
        return this.value;
      },
      set(value) {
        console.log(value);
        this.$emit("input", value);
      },
    },
  },
  methods: {
    saveSelection(e) {
      console.log(e);
      this.$emit("changed");
    },
    toggleRolesPopover() {
      this.$emit("opened", this.name);
    },
    toggleRolesSelectPopover() {
      this.showRolesSelectPopover = !this.showRolesSelectPopover;
    },
  },
};
</script>

<style>
.advanced_restriction_popover {
  padding: 10px;
  max-width: 200px;
}
</style>
<style scoped>
.companyRoles {
  flex-grow: 1;
  border-radius: 5px;
  width: 75px;
}

.advancedRoles-border-active {
  border: 1px solid grey;
}
.advanced-role-noroles {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.advanced_evaluation_restriction {
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  display: flex;
}

.advanced_evaluation_restriction-text {
  font-size: 15px;
  width: 200px;
  flex-grow: 15;
  align-self: center;
  align-items: center;
  display: flex;
  cursor: pointer;
}

.advanced_evaluation_restriction-text-info > .restriction-text-info-icon {
  color: #4294d0;
  padding-left: 3px;
  font-size: 20px;
  padding-right: 3px;
}
.advanced_evaluation_restriction-text-info > .popover {
  padding: 5px;
  max-width: 250px;
}
</style>
