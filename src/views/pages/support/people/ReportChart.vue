
<script>
import { Line } from "vue-chartjs";
export default {
  extends: Line,
  props: {
    data: {
      required: true
    },
    options: {
      required: false,
      default: () => {}
    }
  }, 
  mounted() {
    this.renderChart(this.data, this.options);
  }
};
</script>