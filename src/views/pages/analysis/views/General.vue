<template>
  <div>
    <line-chart
      :labels="getXAxesLabels"
      :datasets="getChartData"
      :options="chartOptions"
      :styles="myStyles"
    ></line-chart>
  </div>
</template>

<script>
import LineChart from "../charts/LineChart";
import { tabLabels } from "@/lib/mode-enums.js";
import { mapGetters } from "vuex";

const xAxesLabels = [
  "Q3 2017",
  "Q4 2017",
  "Q1 2018",
  "Q2 2018",
  "Q3 2018",
  "Q4 2018",
  "Q1 2019",
];

const staticDatasetConfig = {
  hidden: false,
  fill: "start",
  borderWidth: 1,
};

const dynamicDatasetConfig = (
  data = [],
  label = "",
  lineFill = "#add0eb",
  lineBorderColor = "#4394D0",
  currencyValue = "euro",
  currencyColor = "#4394D0"
) => {
  return {
    ...staticDatasetConfig,
    data: data,
    label: label,
    backgroundColor: lineFill,
    borderColor: lineBorderColor,
    currency: { value: currencyValue, color: currencyColor },
  };
};

const options = {
  elements: {
    line: {
      tension: 0,
    },
  },
  scales: {
    yAxes: [
      {
        display: true,
        stacked: true,
        position: "right",
        scaleLabel: {
          padding: 10,
        },
        ticks: {
          beginAtZero: true,
          padding: 10,
          fontColor: "transparent",
        },
        gridLines: {
          display: true,
          zeroLineColor: "#777",
          color: "#777",
          drawOnChartArea: false,
          tickMarkLength: 0,
          z: 1,
        },
      },
    ],
    xAxes: [
      {
        display: true,
        stacked: true,
        scaleLabel: {
          padding: 10,
        },
        ticks: {
          beginAtZero: true,
          fontColor: "#000000",
          padding: 10,
        },
        gridLines: {
          display: true,
          zeroLineColor: "#777",
          color: "#777",
          drawOnChartArea: false,
          tickMarkLength: 0,
          z: 1,
        },
      },
    ],
  },
};

export default {
  name: "General",
  components: {
    "line-chart": LineChart,
  },
  data() {
    return {
      chartOptions: options,
      chartWidth: 400,
      chartHeight: 400,
    };
  },
  computed: {
    ...mapGetters("analysis", [
      "activeTab",
      "selectedTabView",
      "chartTimespan",
      "chartDatasets",
    ]),
    getXAxesLabels() {
      return this.chartTimespan;
    },
    getChartData() {
      const dataSets = this.chartDatasets.map((set) =>
        dynamicDatasetConfig(set.data, set.label)
      );
      return dataSets;
    },
    getSelectedLabels() {
      let formattedLabelText = "";
      switch (this.activeTab) {
        case tabLabels.savingsgrowth:
          formattedLabelText = "Savings + growth";
          break;
        case tabLabels.toolbenefits:
          formattedLabelText = "Tool benefits";
          break;
        case tabLabels.operationbenefits:
          formattedLabelText = "Operation benefits";
          break;
        case tabLabels.operationvalue:
          formattedLabelText = "Operation value";
          break;
        default:
          formattedLabelText = "Savings + growth";
      }
      return formattedLabelText;
    },
    myStyles() {
      return {
        width: this.chartWidth,
        height: this.chartHeight,
        position: "relative",
      };
    },
  },
};
</script>
