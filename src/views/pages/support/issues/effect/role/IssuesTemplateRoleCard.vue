<template>
  <div class="issueTemplate-role__card-container">
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

    <div class="issueTemplate-card__footer">
      <hr />
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
import icoEffectDelete from "@/assets/img/icons/svg/ico-issue-effect-delete.svg?inline";

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

  computed: {
    ...mapGetters({
      processes: "process/all",
      companyRoles: "companyRole/all",
    }),
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
      const issueLoss =
        this.input.effectTime / this.issue.effectedMoneyTotalValue;
      const percentage = issueLoss * 100;
      return percentage.toFixed(2) + " %";
    },

    getTemplateLossPercentageValue() {
      const issueLoss =
        this.input.effectValue / this.issue.effectedMoneyTotalValue;
      const percentage = issueLoss * 100;
      return percentage.toFixed(2) + " %";
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
          console.log(timeArr);
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

.issueTemplate-role__card-container {
  background: #fff;
  height: 200px;
  margin-bottom: 10px;
  border-radius: 3px;
  padding: 10px;
  width: 300px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-left: 10px;
}

.issueEffect_add_form-role {
  font-size: 14px;
  padding: 10px 10px 0 10px;
  color: #4294d0;
}

.issueEffect_addRole-editIcon:hover > button > svg > path {
  fill: #fff;
}

.issueEffect_add_form-new-issue-effect-create-header {
  display: flex;
}

.issueTemplate-role__card-container-item {
  align-items: center;
  padding: 5px 5px 5px 10px;
  display: flex;
  justify-content: space-between;
}

.issueEffect_add_form-new-issue-effect-create-header {
  font-size: 10.5px;
  place-self: center;
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
