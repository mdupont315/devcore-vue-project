<template>
  <div class="page animated fadeIn pgAnalysis">
    <div class="content-wrapper">
      <div class="left">
          <chart></chart>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>
<script>
import Chart from "./Chart";
export default {
  components: {
    chart: Chart
  }
};
</script>