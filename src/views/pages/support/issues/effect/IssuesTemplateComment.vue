<template>
  <div class="issueEffect__comment__container">
    <div class="text-center">
      <b-tooltip :target="() => $refs.issueEffectCommentIcon" variant="primary"
        ><span class="issueEffect__tooltip-title">{{
          $t("issueEffectEdit")
        }}</span></b-tooltip
      >
    </div>

    <b-popover
      ref="popover"
      :target="() => $refs[`issueEffectCommentIcon`]"
      triggers="click"
      :show="openState"
      placement="bottom"
      offset="-155"
      class="form-popover"
      custom-class="issueEffectCommentForm-form-popover"
    >
      <b-card no-body v-if="openState" style="padding: 5px">
        <div
          class="form-label-group select required"
          style="width: 500px; height: 100%"
        >
          <b-textarea
            v-model="commentForm.comment"
            v-autoresize
            class="no-style my-0 issueEffect__comment-text"
            :placeholder="$t('Issue comment')"
            name="comment"
          ></b-textarea>
        </div>
        <div style="display: flex; justify-content: center; padding-top: 5px">
          <b-button
            style="width: 100px; align-self: center; padding: 5px"
            @click="saveIssueComment"
            >{{ $t("Comment") }}</b-button
          >
        </div>
      </b-card></b-popover
    >

    <icoIssueEdit
      @click="toggleIssueComment"
      ref="issueEffectCommentIcon"
      class="issueEffect__editIcon"
      :class="{
        issueEffectIcon__active: openState,
      }"
      width="40px"
      height="40px"
    ></icoIssueEdit>
  </div>
</template>

<script>
import icoIssueEdit from "@/assets/img/icons/svg/ico-issue-edit.svg?inline";

export default {
  components: { icoIssueEdit },
  props: {
    issue: null,
    openState: false,
  },
  data: () => ({
    commentForm: {
      comment: null,
    },
  }),
  methods: {
    toggleIssueComment() {
      console.log(this.openState);
      //toggles modal
      if (this.openState) {
        this.$emit("close");
        return;
      }
      this.$emit("toggle", this.issue, "issueComment");
    },
    saveIssueComment() {
      //emit form
      this.$emit("save", this.commentForm);
    },
  },
};
</script>

<style scoped>
.issueEffect__editIcon:hover path,
.issueEffect__comment__container
  > .issueEffect__editIcon.issueEffectIcon__active
  path {
  fill: #fff;
  background: #4294d0;
}

.issueEffect__editIcon {
  border-radius: 50%;
  outline: none;
  fill: #000;
}

.issueEffect__editIcon:hover {
  background: #4294d0;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}

.issueEffectIcon__active {
  background: #4294d0;
  position: relative;
  z-index: 1;
}

.issueEffect__tooltip-title {
  font-size: 9px;
  line-height: 11px;
  letter-spacing: 1.5px;
  align-content: center;
  text-transform: uppercase;
}

.issueEffect__comment-text {
  min-height: 20px;
  overflow: hidden;
  max-height: 100px;
  border: 1px solid lightgray;
}
</style>
