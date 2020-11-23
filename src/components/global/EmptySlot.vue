<template>
  <div class="empty-slot">
    <slot name="icon">
      <div class="h3 text-center">
        <i class="mdi mdi-flask-empty-outline text-gray-light" style="font-size:80px;font-weight:100"></i>
      </div>
    </slot>
    <slot name="default">
      <div class="h4 text-center text-gray-light">{{$t('Just the empty space...')}}</div>
    </slot>
    <div class="text-center text-gray-light">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: "EmptySlot"
};
</script>