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
      var index = Array.prototype.slice.call(parent.children).indexOf(target);

      this.chart.legend.options.onClick.call(
        this.chart,
        event,
        this.chart.legend.legendItems[index]
      );
      if (this.chart.isDatasetVisible(index)) {
        target.classList.remove("hidden");
      } else {
        target.classList.add("hidden");
      }
    },
    renderChart() {
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
            var totalPotential = {
							value: 0,
							color: "#000000",
							currency: "€",
							text: "Potential"
						};

            // text.push('<ul class="' + chart.id + '-legend">');
            text.push(`<ul class=legend__block-content>`);
            for (var i = 0; i < chart.data.datasets.length; i++) {
              var str = chart.data.datasets[i].label
                ? chart.data.datasets[i].label
                : "";

              const calcTotal = (data, num) => {
                return data + num;
              };
              const currencyContent = (dataset) => {
                const currencyConverted = {
                  euro: "€",
                  dollar: "$",
                };

                return `${dataset.data.reduce(calcTotal)} ${
                  currencyConverted[dataset.currency.value]
                }`;
              };

              const indexedData = chart.data.datasets[i];
              const tagNameBlock = `legend__block-item-outer`;
              text.push(
                `<li style="padding:5px;letter-spacing:1px" class="${tagNameBlock}">
								<div style="color:${
                  indexedData.textColor
                }" class="legend__block-item-inner">${str}</div>
								<div style="color:${
                  indexedData.currency.color
                }" class="legend__block-item-inner"">
								${currencyContent(indexedData)}</div></li>
								`
              );
							totalPotential.value += indexedData.data.reduce(calcTotal);
							totalPotential.color = indexedData.textColor;

            }
            text.push("</ul>");
            text.unshift(`
						<div class="legend__block-total-block">
						<div class="legend__block-total-text">${totalPotential.text.toUpperCase()}</div>
						<div class="legend__block-total-value">${totalPotential.value} ${totalPotential.currency}</div>
						</div>`);

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
      var legendItems = document.getElementsByClassName(
        "legend__block-item-outer"
      );

      for (var i = 0; i < legendItems.length; i += 1) {
        legendItems[i].addEventListener(
          "click",
          this.legendClickCallback,
          false
        );
      }
      this.chart.update();
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  mounted() {
    this.renderChart();
  },
};
</script>

<style lang="scss">
#chart-legends {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
		font-weight: 600;
}

.legend__block-total-value{
	color:#4394D0;
}
.legend__block-total-text{
 letter-spacing: 2px;
 font-size: 1em;
}
.legend__block-content {
  cursor: pointer;
  list-style-type: none;
  padding-left: 0;
}
.legend__block-content li {
  display: inline-block;
  padding: 0 5px;
}
.legend__block-content li.hidden {
  text-decoration: line-through;
}

.analysis-line-chart__container {
  display: flex;
  justify-content: space-between;
  width: 90%;
  height: 60%;
}
</style>
