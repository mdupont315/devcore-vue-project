<template>
  <div>
    <line-chart
      :labels="chartLabels"
      :datasets="chartData"
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

// const dynamicDatasetConfig = (
//   data = [],
//   label = "",
//   fill = "",
//   borderColor = ""
// ) => {
//   return {
//     ...staticDatasetConfig,
//     data: data,
//     label: label,
//     backgroundColor: fill,
//     borderColor: borderColor,
//   };
// };
// console.log(dynamicDatasetConfig);

const options = {
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
          max: 12,
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
      chartLabels: xAxesLabels,
      chartData: [
        {
          label: "ISSUES",
          data: [1, 12, 14, 16, 19, 24, 27],
          backgroundColor: "#add0eb",
          borderColor: "#4394D0",
          color: "#4394D0",
          currency: "euro",
        },
        {
          label: "PEOPLE",
          data: [1, 9, 17, 22, 25, 31, 32],
          backgroundColor: "#4394D0",
          borderColor: "#add0eb",
          color: "#4394D0",
          currency: "euro",
        },
        {
          label: "PROCESS",
          data: [1, 12, 18, 24, 29, 33, 35],
          backgroundColor: "#add0eb",
          borderColor: "#4394D0",
          color: "#4394D0",
          currency: "euro",
        },
        {
          label: "TOOLS",
          data: [1, 14, 19, 26, 31, 35, 39],
          backgroundColor: "#4394D0",
          borderColor: "#add0eb",
          color: "#4394D0",
          currency: "euro",
        },
        {
          label: "IDEAS",
          data: [1, 18, 22, 27, 31, 34, 38],
          backgroundColor: "#add0eb",
          borderColor: "#4394D0",
          color: "#4394D0",
          currency: "euro",
        },
      ],
      chartOptions: options,
      chartWidth: 400,
      chartHeight: 300,
      analyticsData: [
        {
          topic: "issues",
          data: [1125, 1252, 333, 124, 1245, 416, 416],
        },
        {
          topic: "people",
          data: [1125, 1252, 333, 124, 1245, 416, 416],
        },
        {
          topic: "process",
          data: [1125, 1252, 333, 124, 1245, 416, 416],
        },
        {
          topic: "tools",
          data: [1125, 1252, 333, 124, 1245, 416, 416],
        },
        {
          topic: "ideas",
          data: [1125, 1252, 333, 124, 1245, 416, 416],
        },
      ],
    };
  },
  computed: {
    ...mapGetters("analysis", ["activeTab"]),
    getXAxesLabels() {
      return xAxesLabels;
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
