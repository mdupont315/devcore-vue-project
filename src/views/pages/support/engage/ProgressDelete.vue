<template>
  <div class="engage_progress_container_body_item-delete-container">
    <confirm-button
      @confirm="() => $emit('remove', item)"
      :confirmPlacement="'left'"
      :confirmMessage="$t('IssueEffectDeleteConfirmation')"
      :showOverlay="false"
      :btnStyle="'place-content:center;display:flex;background:transparent;border:none;color:#000;align-items:center;box-shadow: none;'"
    >
      <div class="engage_progress_container_body_item-delete-wrapper">
        <icoMilestoneRemove
          width="32px"
          height="32px"
          class="engage_progress_container_body_item-delete-icon"
        ></icoMilestoneRemove>
      </div>
    </confirm-button>
  </div>
</template>

<script>
import icoMilestoneRemove from "@/assets/img/icons/svg/ico-trashcan.svg?inline";
export default {
  components: {
    icoMilestoneRemove,
  },
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
};
</script>
<style scoped>
.engage_progress_container_body_item-delete-icon {
  width: 28px;
  height: 28px;
}
.engage_progress_container_body_item-delete-wrapper {
  margin-top: 40px;
  background: #fff;
  border-radius: 50%;
}

.engage_progress_container_body_item-delete-wrapper:hover {
  background: #dc3545;
}
.engage_progress_container_body_item-delete-container{
	width:15%
}
</style>
