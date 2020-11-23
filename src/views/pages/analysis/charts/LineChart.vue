<template>
  <div class="analysis-line-chart__container">
    <canvas
      ref="analysis__lineChart"
      :width="styles.width"
      :height="styles.height"
      :position="styles.position"
    ></canvas>
    <div id="chart-legends"></div>
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    datasets: {
      type: Array,
      default() {
        return [];
      },
    },
    labels: {
      type: Array,
      default() {
        return [];
      },
    },
    styles: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
    legendClickCallback(event) {
      event = event || window.event;

      var target = event.target || event.srcElement;
      while (target.nodeName !== "LI") {
        target = target.parentElement;
      }
      var parent = target.parentElement;
      var chartId = parseInt(parent.classList[0].split("-")[0], 10);
      console.log(chartId);
      var chart = Chart.instances[chartId];
      var index = Array.prototype.slice.call(parent.children).indexOf(target);

      chart.legend.options.onClick.call(
        chart,
        event,
        chart.legend.legendItems[index]
      );
      if (chart.isDatasetVisible(index)) {
        target.classList.remove("hidden");
      } else {
        target.classList.add("hidden");
      }
    },
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(this.$refs.analysis__lineChart, {
        type: "line",
        data: {
          labels: this.labels,
          datasets: this.datasets,
        },
        options: {
          ...this.options,
          maintainAspectRatio: false,
          responsive: true,
          legendCallback: function (chart) {
            var text = [];
            text.push('<ul class="' + chart.id + '-legend">');
            for (var i = 0; i < chart.data.datasets.length; i++) {
              var str = chart.data.datasets[i].label
                ? chart.data.datasets[i].label
                : "";

              var calcTotal = (data, num) => {
                return data + num;
              };

              text.push(
                `<li style="padding:5px;letter-spacing:1px">
								<div style="color:black">${str}</div>
								<div style="color:${chart.data.datasets[i].color}"> ${chart.data.datasets[
                  i
                ].data.reduce(calcTotal)}
                 </div>
								`
              );
              text.push("</li>");
            }
            text.push("</ul>");
            return text.join("");
          },
          tooltips: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (tooltipItem, data) {
                let label =
                  data.datasets[tooltipItem.datasetIndex].label +
                  " - " +
                  data.labels[tooltipItem.index];
                let datasetLabel =
                  data.datasets[tooltipItem.datasetIndex].data[
                    tooltipItem.index
                  ];
                return label + ": " + datasetLabel.toLocaleString();
              },
            },
          },
          legend: {
            display: false,
          },
        },
      });

      var myLegendContainer = document.getElementById("chart-legends");
      myLegendContainer.innerHTML = this.chart.generateLegend();

      var legendItems = myLegendContainer.getElementsByTagName("li");
      for (var i = 0; i < legendItems.length; i += 1) {
        legendItems[i].addEventListener(
          "click",
          this.legendClickCallback,
          false
        );
      }
    },
  },
  mounted() {
    this.renderChart();
  },
};
</script>

<style>

[class="0-legend"] {
  cursor: pointer;
  list-style-type: none;
  padding-left: 0;
}
[class="0-legend"] li {
  display: inline-block;
  padding: 0 5px;
}
[class="0-legend"] li.hidden {
  text-decoration: line-through;
}
[class="0-legend"] li span {
  border-radius: 5px;
  display: inline-block;
  height: 10px;
  margin-right: 10px;
  width: 10px;
}

.analysis-line-chart__container {
  display: flex;
  justify-content: space-between;
  width: 90%;
  height: 60%;
}
</stylescopedscopedscoped>
