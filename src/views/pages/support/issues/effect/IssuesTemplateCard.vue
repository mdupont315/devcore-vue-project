<template>
  <div class="issueTemplate-card__container" v-if="input">
    <!-- Title -->
    <div class="issueTemplate-card__header">
      <span class="issueTemplate-card__header-title">{{ input.title }}</span>
      <hr style="background: lightgray" />
    </div>

    <div class="issueTemplate-card__footer">
      <div style="padding-bottom: 10px; font-size: 14px">
        {{ $t("Issue specific cost") }}
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
				   <div v-if="input.id == issue.effect.effectId">
          {{ $t("issueEffectTemplateActive") }}
        </div>
        <b-button
          style="
            width: 100%;
            display: flex;
            align-self: center;
            justify-content: center;
            height: 100%;
          "
         v-else
          @click="setTemplate(input)"
        >
          <span v-if="!isLoading">{{ $t("Apply Issue Effect") }} </span>
          <b-spinner v-else style="width: 20px; height: 20px"></b-spinner>
        </b-button>


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
  data: () => ({
    isLoading: false,
  }),
  watch: {
    issue(newVal) {
      if (newVal && this.isLoading) {
        this.isLoading = !this.isLoading;
      }
    },
  },
  computed: {
    ...mapGetters({
      processes: "process/all",
      companyRoles: "companyRole/all",
    }),

    getLossMoneyValue() {
      return this.input.effectValue
        ? this.$currencyReverse(this.input.effectValue / 100)
        : "0€";
    },
    getTemplateLossPercentageTime() {
      if (
        this.issue.effectedMoneyTotalValue != 0 &&
        this.input.effectTime != 0
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
  },
  beforeDestroy() {
    if (this.issue && this.issue.effect) {
      if (this.issue.id != this.issue.effect.issueActiveId) {
        this.$emit("destroyed");
      }
    }
  },
  methods: {
    async setTemplate(input) {
      this.isLoading = true;
      this.$emit("setSelectedTemplate", input.id);
    },
    async unsetTemplate(input) {
      this.$emit("unsetSelectedTemplate", input.id);
    },
  },
};
</script>

<style scoped>
.issueTemplate-card__header-title {
  font-size: 14px;
  color: #4294d0;
}
.issueTemplate-card__header {
  margin-top: 10px;
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
  /* padding: 20px 0 10px 0; */
  display: flex;
  width: 100px;
  height: 30px;
  letter-spacing: 1px;
  justify-content: space-between;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 3px;
  background: #fff;
  min-height: 235px;
  width: 100%;
}
.issueTemplate-card__subheading-title {
  color: #4294d0;
  font-weight: 600;
  padding-right: 5px;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
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
