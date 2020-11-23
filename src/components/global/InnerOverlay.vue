<template>
    <div class="overlay" v-bind="$attrs" @click="$emit('click')"></div>
</template>
<script>
export default {
    name:"InnerOverlay"
}
</script>