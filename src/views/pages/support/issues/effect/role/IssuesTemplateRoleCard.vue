<template>
  <div
    class="issues-template-role-card-container"
    id="issueTemplate-role-card-container"
  >
    <div class="issueTemplate-role__card-container-item">
      <div
        class="issueEffect_add_form-new-issue-effect-create-header"
        @click="remove"
      >
        <icoEffectDelete width="16" height="16" /><span
          style="place-self: center"
          >{{ $t("Delete") }}</span
        >
      </div>

      <div>
        <div class="issueEffect_addRole-editIcon">
          <b-button
            @click="toggle"
            variant="outline-primary"
            style="width: 70px; height: 30px"
          >
            <icoEffectEdit width="16" height="16"
          /></b-button>
        </div>
      </div>
    </div>

    <div class="issueEffect_add_form-role">{{ getTemplateRole }}</div>
    <div
      class="issueEffect_add_form-area"
      ref="issueEffect_add_form-area"
      @mouseover="hoveringPath = true"
      @mouseleave="hoveringPath = false"
    >
      <b-popover
        ref="popover"
        :target="() => $refs['issueEffect_add_form-area']"
        :show="isAreaOverCardWidth"
        triggers="hover"
        placement="top"
        style="padding: 10px; border-radius: 3px"
        class="form-popover"
        ><template #title
          ><span style="font-size: 14px; color: #4294d0">{{
            $t("Area") + ":"
          }}</span></template
        >
        <div
          style="
            display: flex;
            padding: 10px;
            letter-spacing: 1px;
            color: #4294d0;
          "
        >
          <div v-for="(title, index) in getTemplateArea" :key="index">
            <span
              v-if="index !== 'process'"
              style="font-size: 8px; padding-left: 5px"
              >></span
            >
            <span> {{ title }}</span>
          </div>
        </div>
      </b-popover>
      <span style="padding-right: 3px">{{ $t("Area") + ":" }}</span>
      <div class="issueEffect_add_form-area-items" style="display: flex">
        <div
          v-for="(title, index) in getTemplateArea"
          :key="index"
          class="issueEffect_add_form-area-item"
          :style="{
            'max-width': 180 / Object.keys(getTemplateArea).length + 'px',
          }"
        >
          <span
            v-if="index !== 'process'"
            style="font-size: 8px; padding-left: 5px"
            >></span
          >
          <span> {{ title }}</span>
        </div>
      </div>
    </div>

    <div class="issueTemplate-card__footer">
      <hr style="margin: 0" />
      <div class="issueTemplate-card__footer-summary">
        <div class="issueTemplate-card__totals-title">
          {{ $t("Effect Loss Time") }}
        </div>
        <div class="issueTemplate-card__totals-value">
          {{ getLossTimeValue }}
        </div>
        <div class="issueTemplate-card__totals-total">
          {{ getTemplateLossPercentageTime }}
        </div>
      </div>
      <div class="issueTemplate-card__footer-summary">
        <div class="issueTemplate-card__totals-title">
          {{ $t("Effect Loss Value") }}
        </div>
        <div class="issueTemplate-card__totals-value">
          {{ getLossMoneyValue }}
        </div>
        <div class="issueTemplate-card__totals-total">
          {{ getTemplateLossPercentageValue }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import icoEffectEdit from "@/assets/img/icons/svg/ico-issue-effect-edit.svg?inline";
import icoEffectDelete from "@/assets/img/icons/svg/ico-delete.svg?inline";

export default {
  components: {
    icoEffectEdit,
    icoEffectDelete,
  },
  props: {
    input: {
      required: false,
      default: () => {},
    },
    issue: {
      required: false,
      default: () => {},
    },
    identifier: {
      required: false,
    },
  },
  data: () => ({
    hoveringPath: false,
  }),

  computed: {
    ...mapGetters({
      processes: "process/all",
      companyRoles: "companyRole/all",
    }),
    isAreaOverCardWidth() {
      const rendered = document.querySelector(
        ".issueEffect_add_form-area-items"
      );
      if (rendered && this.hoveringPath) {
        return rendered.clientWidth > 160;
      }
      return false;
    },
    getLossTimeValue() {
      return this.formatTime(this.input.effectTime / 100 || 0);
    },

    getLossMoneyValue() {
      const exists = this.input.effectValue && this.input.effectValue > 0;
      return exists
        ? this.$currencyReverse(this.input.effectValue / 100)
        : this.$currencyReverse(0);
    },
    getTemplateLossPercentageTime() {
      if (
        this.input.effectTime != 0 &&
        this.issue.effectedMoneyTotalValue != 0
      ) {
        const issueLoss =
          this.input.effectTime / this.issue.effectedMoneyTotalValue;
        const percentage = issueLoss * 100;
        return percentage.toFixed(2) + " %";
      } else {
        return "0%";
      }
    },

    getTemplateLossPercentageValue() {
      if (
        this.input.effectValue != 0 &&
        this.issue.effectedMoneyTotalValue != 0
      ) {
        const issueLoss =
          this.input.effectValue / this.issue.effectedMoneyTotalValue;
        const percentage = issueLoss * 100;
        return percentage.toFixed(2) + " %";
      } else {
        return "0%";
      }
    },
    getTemplateArea() {
      const { processId, stageId, operationId, phaseId } = this.input;
      let path = {};
      const process = this.processes.find((p) => p.id == processId);
      const stage = process.stages.find((s) => s.id == stageId);
      path.process = process.title;
      if (stage) {
        path["stage"] = stage.title;
        const operation = stage.operations.find((s) => s.id == operationId);
        if (operation) {
          path["operation"] = operation.title;
          const phase = operation.phases.find((s) => s.id == phaseId);
          if (phase) path["phase"] = phase.title;
        }
      }

      return path;
    },
    getTemplateRole() {
      const role = this.companyRoles.find(
        (c) => c.id === this.input.companyRoleId
      );
      return role ? `${this.$t("Role")}: ${role.name}` : "";
    },
  },
  methods: {
    remove() {
      this.$emit("remove", this.identifier);
    },
    deleteItem() {
      this.$emit("delete", this.identifier);
    },
    toggle() {
      this.$emit("edit");
    },
    formatTime(timeInput) {
      if (timeInput) {
        //add leading zeros
        var time = timeInput * 100;
        var timeArr = [...time.toString()];

        while (timeArr.length < 4) {
          timeArr.unshift("0");
        }

        return `${timeArr[0]}${timeArr[1]}h ${timeArr[2]}${timeArr[3]}min`;
      } else {
        return "00h 00min";
      }
    },
  },
};
</script>

<style scoped>
.issueTemplate-card__footer-summary {
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  padding: 10px;
}
.issueTemplate-card__totals-title {
  color: #000;
  width: 100px;
}
.issueTemplate-card__totals-value {
  color: #4294d0;
}
.issueTemplate-card__totals-total {
  color: #cc454b;
}
.issueTemplate-card__totals-action {
  padding-top: 10px;
}

.issues-template-role-card-container {
  background: #fff;
  border-radius: 3px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-left: 10px;
  height: 275px;
  width: 255px;
}

.issueEffect_add_form-role {
  font-size: 14px;
  padding: 10px 10px 0 10px;
  color: #4294d0;
}

.issueEffect_add_form-area {
  font-size: 14px;
  padding: 0 10px;
  color: #4294d0;
  max-height: 100px;
  display: flex;
  overflow: scroll;
}

.issueEffect_add_form-area-item {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.issueEffect_addRole-editIcon:hover > button > svg > path {
  fill: #fff;
}

.issueEffect_add_form-new-issue-effect-create-header {
  display: flex;
}

.issueTemplate-role__card-container-item {
  align-items: center;
  width: 100%;
  place-self: center;
  padding: 10px 5px 5px 10px;
  display: flex;
  justify-content: space-between;
}

.issueEffect_add_form-new-issue-effect-create-header {
  font-size: 12px;
  place-self: center;
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
