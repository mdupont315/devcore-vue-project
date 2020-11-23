<template>
  <div
    v-click-outside="ousideClicked"
    class="super-select"
    :class="{
      expanded: expanded,
      'is-invalid': state === false,
      'no-field': !showInput,
    }"
  >
    <div v-if="showInput" class="input-wrapper" @click="toggleExpanded">
      <b-form-input
        ref="input"
        v-model="filterValue"
        type="text"
        name="input"
        class="field"
        :placeholder="
          expanded
            ? activePlaceholder
            : dataValue && dataValue.length > 0
            ? null
            : placeholder
        "
        :class="{ focused: expanded }"
        :disabled="disabled"
        @keyup="filter"
        @focus="open"
      />
      <div class="header-display">
        <div
          v-if="!expanded && dataValue && dataValue.length > 0"
          class="counter"
        >
          <slot
            name="selection-count"
            v-bind="{ values: this.dataValue || [], items: items }"
            >{{
              $tc(
                "selection.count",
                dataValue && dataValue.length ? dataValue.length : 0
              )
            }}</slot
          >
        </div>
        <div class="items">
          <div class="d-flex overflow-hidden justify-content-end">
            <div class="flex-grow-1" style="max-width: 65%">
              <slot
                name="header-display"
                v-bind="{ values: this.dataValue || [], items: items }"
              ></slot>
            </div>
            <div
              v-show="dataValue && dataValue.length > 0"
              ref="headerOverflowSelected"
              v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
              style="font-size: 0.8rem"
              class="overflow-selected"
              :title="$t('Click to see all items')"
              @click.stop="close"
            >
              <slot
                name="header-display-overflow"
                v-bind="{ values: this.dataValue || [], items: items }"
                >{{
                  dataValue && dataValue.length > maxDisplayItems
                    ? dataValue.length - maxDisplayItems + " " + $t("more")
                    : "..."
                }}</slot
              >
            </div>
          </div>
          <b-popover
            ref="headerOverflowSelectedPopover"
            :target="() => $refs.headerOverflowSelected"
            placement="right"
            class="form-popover"
          >
            <b-card
              v-click-outside="closeHeaderDetailsPopOver"
              no-body
              style="width: 200px"
            >
              <div
                v-if="dataValue"
                class="p-2 pb-0 border-bottom bg-light"
                style="border-radius: 3px 3px 0 0"
              >
                <span class="h5"
                  >{{ dataValue.length }} {{ $t("selected") }}</span
                >
                <span
                  class="close cursor-pointer float-right"
                  @click="closeHeaderDetailsPopOver"
                >
                  <i class="mdi mdi-close"></i>
                </span>
              </div>
              <b-card-body
                style="max-height: 178px; overflow: auto; font-size: 1.1rem"
              >
                <slot
                  name="display-details"
                  v-bind="{ values: this.dataValue || [], items: items }"
                ></slot>
              </b-card-body>
            </b-card>
          </b-popover>
        </div>
      </div>
    </div>
    <div class="dropdown" :class="selectorClass">
      <div class="header">
        <slot name="dropdown-header"></slot>
      </div>
      <div
        v-if="allowSelectAll && mode === 'multiple'"
        class="dropdown-actions text-right p-1 px-3"
      >
        <span class="cursor-pointer text-primary" @click.stop="selectAll">{{
          $t("All")
        }}</span>
        |
        <span class="cursor-pointer text-primary" @click.stop="unselectAll">{{
          $t("None")
        }}</span>
        |
        <span class="cursor-pointer text-primary" @click.stop="toggleAll">{{
          $t("Toggle")
        }}</span>
      </div>
      <ul v-if="filteredItems && filteredItems.length > 0" class="items">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="item"
          :class="{
            selected: isSelected(item),
            disabled: isItemDisabled(item),
          }"
          :data-value="getItemValue(item)"
          :data-label="getItemLabel(item)"
          :data-disabled="isItemDisabled(item)"
          @click.stop="toggleItem(item, $event)"
        >
          <slot
            name="dropdown-item"
            v-bind="{
              item: item,
              selected: isSelected(item),
              label: getItemLabel(item),
              value: getItemValue(item),
            }"
            >{{ getItemLabel(item) }}</slot
          >
        </li>
      </ul>
      <div v-else class="empty">
        <slot name="empty-text">
          <p class="alert alert-warning m-3">
            {{ $t("There are no records for the given criteria") }}
          </p>
        </slot>
      </div>
      <div v-if="showFooter" class="footer">
        <slot name="dropdown-footer">
          <span class="close" @click.stop="close">
            <i class="mdi mdi-close"></i>
          </span>
          <div class="content">
            <div class="d-flex w-100">
              <div class="flex-grow-1">
                <slot
                  name="footer-display"
                  v-bind="{ values: this.dataValue || [], items: items }"
                ></slot>
              </div>
              <div
                v-if="showFooterSelection"
                v-show="dataValue && dataValue.length > 0"
                ref="footerOverflowSelected"
                v-b-tooltip="{ placement: 'top', boundary: 'viewport' }"
                class="overflow-selected"
                :title="$t('Click to see all items')"
              >
                {{
                  dataValue && dataValue.length > maxDisplayItems
                    ? dataValue.length - maxDisplayItems + " " + $t("more")
                    : "..."
                }}
              </div>
            </div>
            <b-popover
              v-if="expanded && showFooterSelection"
              ref="footerOverflowSelectedPopover"
              :target="() => $refs.footerOverflowSelected"
              placement="right"
              class="form-popover"
            >
              <b-card
                v-click-outside="closeFooterDetailsPopOver"
                no-body
                style="width: 200px"
              >
                <div
                  v-if="dataValue"
                  class="p-2 pb-0 border-bottom bg-light"
                  style="border-radius: 3px 3px 0 0"
                >
                  <span class="h5"
                    >{{ dataValue.length }} {{ $t("selected") }}</span
                  >
                  <span
                    class="close cursor-pointer float-right"
                    @click="closeHeaderDetailsPopOver"
                  >
                    <i class="mdi mdi-close"></i>
                  </span>
                </div>
                <b-card-body
                  style="max-height: 178px; overflow: auto; font-size: 1.1rem"
                >
                  <slot
                    name="display-details"
                    v-bind="{ values: this.dataValue || [], items: items }"
                  ></slot>
                </b-card-body>
              </b-card>
            </b-popover>
          </div>
          <div v-if="showAddBtn" class="addNew">
            <slot name="footer-add-btn"></slot>
          </div>
          <small v-if="mode === 'multiple'" class="counter">
            <slot
              name="selection-count"
              v-bind="{ values: this.dataValue || [], items: items }"
              >{{
                $tc(
                  "selection.count",
                  dataValue && dataValue.length ? dataValue.length : 0
                )
              }}</slot
            >
          </small>
        </slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "SuperSelect",
  props: {
    placeholder: {
      required: false,
    },
    maxDisplayItems: {
      required: false,
      type: Number,
      default: () => 5,
    },
    activePlaceholder: {
      required: false,
      default () {
        return this.$t("Type to search");
      },
    },
    disabled: {
      required: false,
    },
    mode: {
      type: String,
      validator: (val) => ["single", "multiple"].includes(val),
      default: () => "multiple",
    },
    value: {
      required: false,
    },
    items: {
      required: true,
    },
    name: {
      required: false,
      default: () => `super_select_${Math.random()}`,
    },
    allowSelectAll: {
      required: false,
      default: () => true,
    },
    isSelectedFn: {
      name: "item-selected",
      required: false,
      type: Function,
    },
    getItemValueFn: {
      name: "item-value",
      required: false,
      type: Function,
    },
    valueKey: {
      name: "value-key",
      required: false,
      type: String,
      default: () => "id",
    },
    getItemLabelFn: {
      name: "item-label",
      required: false,
      type: Function,
    },
    labelKey: {
      name: "label-key",
      required: false,
      type: String,
      default: () => "name",
    },
    isItemDisabledFn: {
      name: "item-disabled",
      required: false,
      type: Function,
    },
    showInput: {
      name: "show-input",
      required: false,
      type: Boolean,
      default: () => true,
    },
    showFooter: {
      name: "show-footer",
      required: false,
      type: Boolean,
      default: () => true,
    },
    showFooterSelection: {
      required: false,
      type: Boolean,
      default: () => true,
    },
    selectorClass: {
      required: false,
      name: "selector-class",
    },
    state: {
      required: false,
    },
    showAddBtn: {
      name: "show-add-btn",
      required: false,
      default: () => false,
      type: Boolean,
    },
    outsideClose: {
      name: "outside-close",
      required: false,
      default: () => false,
      type: Boolean,
    },
    filterFn: {
      required: false,
      type: Function,
    },
  },
  $_veeValidate: {
    // fetch the current value from the innerValue defined in the component data.
    name() {
      return this.label;
    },
    value() {
      return this.value;
    },
  },
  data: () => ({
    dataValue: null,
    expanded: false,
    filterValue: null,
    filteredItems: [],
  }),
  mounted() {
    if (!this.value) {
      if (this.mode === "single") {
        this.dataValue = null;
      } else {
        this.dataValue = [];
      }
    } else {
      this.dataValue = [];
      this.dataValue = this.value.filter((v) => {
        return this.items.find((o) => this.getItemValue(o) === v) != null;
      });
    }
    this.filteredItems = this.items;
  },
  methods: {
    closeHeaderDetailsPopOver() {
      this.$refs.headerOverflowSelectedPopover.$emit("close");
    },
    closeFooterDetailsPopOver() {
      this.$refs.footerOverflowSelectedPopover.$emit("close");
    },
    setDataValue(value) {
      this.dataValue = value;
    },
    toggleExpanded(event) {
      if (this.expanded) {
        this.close(event);
      } else {
        this.open(event);
        if (this.$refs.input) {
          this.$refs.input.focus();
        }
      }
      this.$emit("toggled", this.expanded, event);
    },
    close(event) {
      this.expanded = false;
      this.filterValue = null;
      this.filter(null);
      this.$emit("close", event);
    },
    open(event) {
      this.expanded = true;
      this.$emit("open", event);
    },
    isSelected(item) {
      if (this.isSelectedFn) {
        return this.isSelectedFn(item);
      }
      const itemValue = this.getItemValue(item);
      if (this.mode === "single") {
        return itemValue === this.dataValue;
      } 
        this.dataValue = this.dataValue || [];
        return this.dataValue.some((i) => i === itemValue);
      
    },
    isItemDisabled(item) {
      if (this.isItemDisabledFn) {
        return this.isItemDisabledFn(item);
      }
      return false;
    },
    getItemValue(item) {
      if (this.getItemValueFn) {
        return this.getItemValueFn(item);
      }
      if (typeof item === "object" && item != null) {
        return item[this.valueKey];
      }
      return item;
    },
    getItemLabel(item) {
      if (this.getItemLabelFn) {
        return this.getItemLabelFn(item);
      }
      if (typeof item === "object" && item != null) {
        return item[this.labelKey];
      }
      return item;
    },
    toggleItem(item, event) {
      if (this.isSelected(item)) {
        this.deselectItem(item, event);
      } else {
        this.selectItem(item, event);
      }
      if (this.$refs.input) {
        this.$refs.input.focus();
      }

      let itemFound = false;
      this.filteredItems.map((r) => {
        if (r.id === item.id) {
          itemFound = true;
        }
      });

      if (itemFound == false) {
        this.filteredItems.push(item);
      }

      this.$emit("input", this.dataValue, event);
    },
    selectItem(item, event) {
      if (this.mode === "single") {
        this.dataValue = this.getItemValue(item);
        this.close();
      } else {
        this.dataValue = this.dataValue || [];
        this.dataValue.push(this.getItemValue(item));
      }
      this.$emit("itemSelected", item, event);
    },
    selectAll() {
      this.filteredItems.map((i) => {
        if (!this.isSelected(i)) {
          this.selectItem(i);
        }
      });

      this.$emit("input", this.dataValue, event);
    },
    deselectItem(item, event) {
      if (this.mode === "single") {
        this.dataValue = null;
        this.close();
      } else {
        this.dataValue = this.dataValue || [];
        this.dataValue = this.dataValue.filter(
          (v) => v != this.getItemValue(item)
        );
      }
      this.$emit("itemUnselected", item, event);
    },
    unselectAll() {
      this.filteredItems.map((i) => {
        this.deselectItem(i);
      });
      this.$emit("input", this.dataValue, event);
    },
    toggleAll() {
      this.filteredItems.map((i) => {
        if (this.isSelected(i)) {
          this.deselectItem(i);
        } else {
          this.selectItem(i);
        }
      });
      this.$emit("input", this.dataValue, event);
    },
    ousideClicked() {
      if (this.outsideClose & this.expanded) {
        this.close();
      }
    },
    async filter(event) {
      if (this.filterFn) {
        this.filteredItems = await this.filterFn(this.filterValue, event);
      } else {
        this.filteredItems = this.items;
      }
    },
  },
};
</script>