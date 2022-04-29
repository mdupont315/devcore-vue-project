<template>
  <span v-b-tooltip class="time-ago" :title="$tc('time.at', parsedTime)">{{ text }}</span>
</template>
<script>
import moment from "moment";

export default {
  name: "TimeAgo",
  props: {
    time: {
      required: false
    }
  },
  data: () => ({
    text: null,
    parsedTime: null
  }),
  mounted() {
    this.count();
    this.parsedTime = moment.utc(this.time).local().format("DD/MM/YYYY HH:mm:ss");
  },
  beforeDestroy() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  },
  methods: {
    count() {
      if (!this.time || !this.$tc) {
        return 0;
      }
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      let interval = 1000;
      const newTime = moment.utc();
      const oldTime = moment.utc(this.time);
      const diff = moment
        .duration(newTime.diff(oldTime))
        .abs()
        .asSeconds();

      if (diff < 60) {
        this.text = this.$tc(
          "time.ago",
          this.$tc("seconds.count", Math.floor(diff))
        );
      } else if (diff < 3600) {
        this.text = this.$tc(
          "time.ago",
          this.$tc("minutes.count", Math.floor(diff / 60))
        );
        interval = 60000;
      } else if (moment.duration(newTime.diff(oldTime)).asDays() === 1) {
        this.text = `${this.$t("yesterday")} ${this.$t("at")} ${oldTime.format(
          "HH:mm:ss"
        )}`;
        interval = 600000;
      } else if (diff < 86400) {
        this.text = this.$tc(
          "time.ago",
          this.$tc("hours.count", Math.floor(diff / 3600))
        );
        interval = 6000000;
      } else if (diff < 604800) {
        this.text = this.text = this.$tc(
          "time.ago",
          this.$tc(
            "days.count",
            Math.floor(moment.duration(newTime.diff(oldTime)).asDays() + 1)
          )
        );
        this.text = `${this.text} ${this.$t("at")} ${oldTime.format(
          "HH:mm:ss"
        )}`;
        interval = 6000000;
      } else {
        this.text = oldTime.format("DD/MM/YYYY HH:mm");
        interval = 0;
      }
      if (interval > 0) {
        this.updateTimeout = setTimeout(this.count, interval);
      }
    }
  }
};
</script>