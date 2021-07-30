<template>
  <div class="issueTemplate-card__container" v-if="input">
    <!-- Title -->
    <div class="issueTemplate-card__header">
      <span class="issueTemplate-card__header-title">{{ input.title }}</span>
    </div>

    <hr />

    <div class="issueTemplate-card__footer">
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
      <div class="issueTemplate-card__totals-action">
        <b-button
				v-if="input.id !== issue.effectTemplateId"
          @click="setTemplate(input)"
          class="issueTemplate-card__totals-action-select"
          >{{ $t("Apply Issue Effect") }}</b-button
        >
				<div v-else>
					Template active
				</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  props: {
    input: {
      required: false,
      default: () => {},
    },
    issue: {
      required: false,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters({
      processes: "process/all",
      companyRoles: "companyRole/all",
    }),

    getLossTimeValue() {
      return this.formatTime(this.input.effectTime);
    },
    getLossMoneyValue() {
      return this.input.effectValue
        ? this.$currencyReverse(this.input.effectValue / 100)
        : "0€";
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
  },
  methods: {
    async setTemplate(input) {
      this.$emit("setSelectedTemplate", input.id);
    },
    async unsetTemplate(input) {
      this.$emit("unsetSelectedTemplate", input.id);
    },
    formatTime(time) {
      if (time) {
        var numberPattern = /\d+/g;
        const test = time.toString().match(numberPattern).join("");
        return `${test.charAt(0)}${test.charAt(1)}h ${test.charAt(
          2
        )}${test.charAt(3)}min`;
      } else {
        return "00h 00min";
      }
    },
  },
};
</script>

<style scoped>
.issueTemplate-card__header-title {
  font-size: 14px;
  color: #4294d0;
}

.issueTemplate-card__body-process {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
}
.issueTemplate-card__body-process-name {
  display: flex;
  align-items: center;
}

.issueTemplate-card__body-stage-name,
.issueTemplate-card__body-operation-name,
.issueTemplate-card__body-phase-name {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 75px;
}
.issueTemplate-card__body {
  font-size: 12px;
}

.issueTemplate-card__body-loss {
  display: flex;
  padding: 0 10px;
}
.issueTemplate-card__body-loss__value {
  margin-left: 20px;
  color: #cc454b;
}
.issueTemplate-card__totals-action {
  padding-top: 10px;
  display: flex;
  letter-spacing: 1px;
  justify-content: space-between;
}
.issueTemplate-card__totals-action-select {
  letter-spacing: 1px;
}
.issueTemplate-card__totals-action-deselect {
  background: #cc454b;
  letter-spacing: 1px;
}
.issueTemplate-card__footer-summary {
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  padding: 10px 10px 10px 0;
}
.issueTemplate-card__totals-title {
  color: #000;
  width: 100px;
  flex-grow: 1;
}
.issueTemplate-card__totals-value {
  color: #4294d0;
  flex-grow: 1;
}
.issueTemplate-card__totals-total {
  color: #cc454b;
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
}
.issueTemplate-card__body-role {
  font-weight: 400;
}

.issueTemplate-card__body-roleAndLoss {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 16px;
}

.issueTemplate-card__container {
  padding: 20px;
}
.issueTemplate-card__subheading-title {
  color: #4294d0;
  font-weight: 600;
  padding-right: 5px;
  font-size: 16px;
}
.issueTemplate-card__subheading-process-separator {
  padding: 0 5px;
  font-size: 8px;
  align-self: center;
}
.issueTemplate-card__subheading-process-name {
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.issueTemplate-card__subheading-process {
  display: flex;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
