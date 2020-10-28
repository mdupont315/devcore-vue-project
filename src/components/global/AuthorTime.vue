<template>
  <div class="author-time" v-if="user">
    <img :src="user.getAvatarUrl('50x50')" height="30" class="rounded-circle border" />
    <span class="right">
      <span class="name">{{ user.fullName }}</span>
      <time-ago class="time" :time="time" v-if="time" />
    </span>
  </div>
</template>
<script>
export default {
  name: "author-time",
  props: {
    user: {
      required: true
    },
    time: {
      required: false
    }
  }
};
</script>