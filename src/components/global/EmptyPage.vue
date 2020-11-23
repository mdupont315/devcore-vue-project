<template>
  <div class="empty-page">
    <slot name="icon">
      <div class="h3 text-center">
        <i class="mdi mdi-flask-empty-outline text-white" style="font-size:100px"></i>
      </div>
    </slot>
    <slot name="default">
      <div class="h2 text-center text-white">{{$t('Just the empty space...')}}</div>
    </slot>
    <div class="text-center text-white">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "EmptyPage"
};
</script>