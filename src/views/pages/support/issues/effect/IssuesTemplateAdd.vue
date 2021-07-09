<template>
  <div style="justify-content: flex-start">
    <b-button
      size="xs"
      ref="issueEffectAddBtn"
      variant="action"
      @click="toggleIssueOpenSelect()"
      class="
        btn-primary btn-block
        text-uppercase text-bold
        issueEffectAddOpen-btn
      "
      ><div class="issue_effect_add">
        <div style="flex-grow: 2; padding: 10px">{{ $t("Add") }}</div>
        <div style="place-self: center">
          <div
            class="issue_effect_add_icon"
            :style="openState ? 'transform: rotate(180deg)' : ''"
          >
            <i class="mdi mdi-chevron-down issue_effect_add_icon_chevron"></i>
          </div>
        </div>
      </div>
    </b-button>

    <b-popover
      ref="popover"
      :target="() => $refs[`issueEffectAddBtn`]"
      triggers="click"
      :show="openState"
      placement="bottom"
      offset="115"
      class="form-popover"
      custom-class="issueEffectAddForm-form-popover"
    >
      <b-card no-body v-if="openState" style="width: 350px">
        <div class="form-label-group select required">
          <div
            v-if="!issueEffectCreateTemplateOpen"
            class="issueEffect_add_form-new-issue-effect-select"
            @click="toggleIssueTemplateForm"
          >
            <div>
              <icoChevronDown width="22" height="22"></icoChevronDown>

              <span class="issueEffect_add_form_newText">{{
                $t("New Issue Effect")
              }}</span>
            </div>
          </div>
          <div v-else class="issueEffect_add_form-new-issue-effect-create">
            <div class="issueEffect_add_form-new-issue-effect-create-header">
              <i
                class="mdi mdi-arrow-left"
                style="font-size: 20px"
                @click="issueEffectCreateTemplateOpen = false"
              ></i>
              <b-button> Add Another Role</b-button>
            </div>
          </div>
          <div
            style="overflow: scroll; max-height: 230px"
            v-if="!issueEffectCreateTemplateOpen && items.length>0"
          >
            <div
              v-for="(item, index) in items"
              :key="index"
              class="issueEffect_add_form_templates"
              :class="
                issueEffectTemplateActiveIndex === index
                  ? 'form_templates-active'
                  : 'form_templates-not-active'
              "
              @mouseover="mouseOverIndex = index"
              @mouseleave="mouseOverIndex = null"
              @click="issueEffectTemplateActiveIndex = index"
            >
              <div
                v-if="
                  index == issueEffectTemplateActiveIndex ||
                  mouseOverIndex == index
                "
                class="issueEffect_add_form_templates-item"
              >
                <div class="issueEffect_add_form_templates-item-selected">
                  <div style="flex-grow: 1; padding: 10px">
                    <icoCheck width="10" height="10"></icoCheck>
                  </div>
                  <div style="flex-grow: 20; font-weight: 500; padding: 10px">
                    {{ item.title }}
                  </div>
                </div>
                <div class="issueEffect_add_form_templates_item-edit">
                  {{ $t("Edit") }}
                </div>
              </div>
              <div v-else>
                <div
                  class="issueEffect_add_form_templates_item-text-not-active"
                  style="margin-left: 10px"
                >
                  {{ item.title }}
                </div>
              </div>
            </div>
          </div>
          <div v-else style="padding: 20px">
            <issue-effect-create-form />
          </div>
        </div>
      </b-card>
    </b-popover>
  </div>
</template>
<script>
import icoCheck from "@/assets/img/icons/svg/ico-check.svg?inline";
import icoChevronDown from "@/assets/img/icons/svg/ico-chevron-down.svg?inline";
import GQLForm from "@/lib/gqlform";
import IssuesTemplateForm from "./IssuesTemplateForm.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    icoCheck,
    icoChevronDown,
    "issue-effect-create-form": IssuesTemplateForm,
  },
  props: {
    items: {
      required: false,
      default: () => [],
    },
    issue: {
      required: false,
      default: () => {},
    },
    openState: {
      required: true,
      default: () => false,
    },
  },

  computed: {
    ...mapGetters({
      companyRoles: "companyRole/all",
      processes: "process/all",
      users: "user/all",
    }),
  },
  data: () => ({
    mouseOverIndex: null,
    issueEffectCreateTemplateOpen: false,
    issueEffectAddOpen: false,
    issueEffectTemplateActiveIndex: null,
    form: new GQLForm({
      title: null,
      companyRoleId: [],
      processId: null,
    }),
  }),
  watch: {
    issueEffectTemplateActiveIndex: {
      handler(index) {
        console.log(this.items[index]);
        this.$emit("selectedTemplate", this.items[index]);
      },
    },
  },
  methods: {
    toggleIssueTemplateForm() {
      this.issueEffectTemplateActiveIndex = null;
      this.issueEffectCreateTemplateOpen = !this.issueEffectCreateTemplateOpen;
    },
    toggleIssueOpenSelect() {
      this.$emit("toggle", this.issue, "issueAdd");
    },
  },
};
</script>

<style scoped>
.issueEffectAddOpen-btn {
  display: flex;
  font-size: 1.2rem;
  white-space: nowrap;
  min-width: min-content;
  max-width: 91px;
  height: 35px;
  align-items: center;
  justify-content: center;
}
.issue_effect_add {
  padding: 0 5px;
  display: flex;
  width: 100%;
}

.issue_effect_add_icon {
  background: #fff;
  color: rgb(66, 148, 208);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-grow: 1;
}

.issue_effect_add_icon_chevron {
  display: flex;
  transform: translate(0px, -2px);
  place-content: center;
}

.issueEffectAddForm-form-popover > .arrow {
  display: none !important;
}

.issueEffect_add_form_templates {
  display: flex;
  width: 100%;
  height: 30px;
  background: #fff;
  align-items: center;
  cursor: pointer;
}

.issueEffect_add_form-new-issue-effect-select {
  display: flex;
  width: 100%;
  height: 40px;
  background: #fff;
  align-items: center;
  cursor: pointer;
  padding-left: 10px;
}

.issueEffect_add_form-new-issue-effect-select:hover {
  background: #4294d0;
  color: #fff;
}

.issueEffect_add_form-new-issue-effect-create {
  display: flex;
  height: 40px;
  background: #fff;
  align-items: center;
  cursor: pointer;
  height: 100%;
  width: 100%;
}

.issueEffect_add_form_templates_item-edit {
  text-transform: uppercase;
  display: flex;
  padding: 10px;
  background: #fff;
  color: #000;
}

.issueEffect_add_form_templates_item-edit:hover {
  background: #4294d0;
  color: #fff;
}

.form_templates-active {
  background: #4294d0;
  color: #fff;
}

.issueEffect_add_form_newText {
  margin-left: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}
.issueEffect_add_form_templates-item {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  letter-spacing: 1px;
  line-height: 12px;
  cursor: pointer;
}
.issueEffect_add_form_templates-item-selected {
  display: flex;
  width: 100%;
}
.issueEffect_add_form-new-issue-effect-create-header {
  padding: 20px 20px 0 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issueEffect_add_form_templates-item-selected:hover,
.issueEffect_add_form_templates_item-edit:hover {
  background: #4294d0;
  color: #fff;
}
</style>
