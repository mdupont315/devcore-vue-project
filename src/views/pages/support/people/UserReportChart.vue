<template>
  <div
    class="idea-report idea-report-chart report-chart d-flex flex-column bg-light"
    style="min-height:250px"
  >
    <div class="period-selector text-right p-2 px-4 flex-grow-0 position-relative">
      <unit-selector :units="intervals" v-model="filter.data.interval" @change="changePeriod" />
      <!-- <div class="text-right pr-4 float-right position-absolute" style="top:3px; right:0">
        <span v-if="idea.evaluationsCount > 0" class="font-15x ml-2 float-right">
          <b-badge variant="black">{{ $tc('evaluation.count', idea.evaluationsCount) }}</b-badge>
        </span>
      </div>-->
    </div>
    <div
      v-if="!filter.busy && chartData"
      class="flex-grow-1 justify-content-center flex-column d-flex"
    >
      <report-chart :data="chartData.data" :options="chartData.options" style="height:200px"></report-chart>
    </div>
    <div v-else class="text-center flex-grow-1 d-flex justify-content-center flex-column">
      <b-spinner variant="primary" style="margin:0 auto"></b-spinner>
    </div>
  </div>
</template>
<script>
import moment from "moment";
import { numberFormat } from "@/lib/functions";
import ReportChart from "./ReportChart";
export default {
  components: {
    "report-chart": ReportChart
  },
  props: {
    project: {
      required: true
    },
    user: {
      required: true
    }
  },
  data: () => ({
    intervals: [
      {
        value: "day",
        label: "Day",
        cssClass: {}
      },
      {
        value: "month",
        label: "Month",
        cssClass: {}
      },
      {
        value: "quarter",
        label: "Quarter",
        cssClass: {}
      },
      {
        value: "year",
        label: "Year",
        cssClass: {}
      }
    ],
    filter: {
      busy: true,
      data: {
        from: null,
        to: null,
        interval: "month"
      }
    },
    chartData: null
  }),
  async mounted() {
    await this.drawReport();
  },
  methods: {
    async changePeriod(unit) {
      this.filter.data.interval = unit;
      this.$nextTick(() => {
        this.drawReport();
      });
    },
    async drawReport() {
      this.chartData = null;
      const reportData = await this.getReportData();

      const datasets = {
        average: {
          backgroundColor: "rgb(150, 150, 150, .6)",
          borderColor: "rgb(150, 150, 150)",
          label: this.$t("Average"),
          pointRadius: 1,
          fill: false,
          data: [],
          borderWidth: 2,
          lineTension: 0
        },
        current_average: {
          backgroundColor: "rgb(66, 148, 208, .6)",
          borderColor: "rgb(66, 148, 208)",
          label: this.user.fullName,
          pointRadius: 1,
          fill: false,
          data: [],
          borderWidth: 2,
          lineTension: 0
        }
      };
      const data = {
        labels: [],
        datasets: []
      };

      let max = 0;

      Object.keys(reportData.data)
        .sort((a, b) => (a > b ? 1 : -1))
        .map(k => {
          const d = reportData.data[k];
          data.labels.push(k);
          max =
            max > Math.abs(d["loss"]["total"])
              ? max
              : Math.abs(d["loss"]["total"]);
          max =
            max > Math.abs(d["gain"]["total"])
              ? max
              : Math.abs(d["gain"]["total"]);

          datasets["average"].data.push(
            numberFormat(d["general_total_Value"]["average"] / 100)
          );

          datasets["current_average"].data.push(
            numberFormat(d["total_value"]["total"] / 100)
          );
        });

      data.datasets = Object.keys(datasets).map(i => {
        return datasets[i];
      });

      this.chartData = {
        data: data,
        options: {
          defaultFontSize: 8,
          responsive: true,
          legend: {
            position: "bottom",
            labels: {
              fontSize: 8
            }
          },
          maintainAspectRatio: false,
          borderWidth: 0.5,
          scales: {
            yAxes: [
              {
                ticks: {
                  //   suggestedMin: -max / 100,
                  //   suggestedMax: max / 100,
                  beginAtZero: true,
                  fontSize: 8
                },
                scaleLabel: {
                  display: true,
                  labelString: reportData.currency.name,
                  fontSize: 8
                }
              }
            ],
            xAxes: [
              {
                ticks: {
                  fontSize: 8
                },
                gridLines: {
                  display: false
                },
                scaleLabel: {
                  display: true,
                  labelString: this.$t(this.filter.data.interval.ucFirst()),
                  fontSize: 8
                }
              }
            ]
          }
        }
      };
    },
    async getReportData() {
      this.filter.data.id = this.user.id;
      this.filter.data.projectId = this.project.projectId;
      //   this.filter.data.to = moment()
      //     .utc()
      //     .format("YYYY-MM-DD HH:mm:ss");
      //   this.filter.data.from = moment()
      //     .utc();
      //     .add("year", -1)

      let from = moment().utc();
      let to = moment().utc();

      switch (this.filter.data.interval) {
        case "quarter":
        case "month":
          from = from.add("year", -1);
          break;
        case "day":
          from = from.add("month", -1);
          break;
        case "year":
          from = from.add("year", -5);
          break;
      }

      this.filter.data.from = from.format("YYYY-MM-DD HH:mm:ss");
      this.filter.data.to = to.format("YYYY-MM-DD HH:mm:ss");

      return await this.$store.dispatch(
        "report/userProjectReport",
        this.filter
      );
    }
  }
};
</script>