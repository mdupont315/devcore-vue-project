<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  data: () => ({
    chartdata: {
      labels: ["January", "February", "March"],
      datasets: [
        {
          backgroundColor: "rgb(0,255,0, .3)",
          borderColor: "rgb(0,255,0)",
          data: [8, 4, 3],
          hidden: false,
          label: "D0",
          fill:"start",
          borderWidth:1
        },
        {
          backgroundColor: "rgba(255,0,0,.3)",
          borderColor: "rgba(255,0,0)",
          data: [3, 8, 2],
          label: "D1",
          borderWidth:1,
          fill: "start"
        },
        {
          backgroundColor: "rgba(0,0,255,.3)",
          borderColor: "rgba(0,0,255)",
          data: [6, 4, 9],
          hidden: false,
          label: "D2",
          borderWidth:1,
          fill: "start"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      borderWidth:.5
    }
  }),

  mounted() {
    this.renderChart(this.chartdata, this.options);
  }
};
</script>