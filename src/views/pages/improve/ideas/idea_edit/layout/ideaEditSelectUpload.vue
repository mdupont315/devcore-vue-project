<template>
  <div class="idea_edit_content_container_content-header-upload-selector">
    <div
      v-for="(item, index) in contentUploadOptions"
      :key="index"
      class="idea_edit_content_container_content-header-upload-selector-item"
      @click="selectUploadOption(item, index)"
    >
      <label
        for="idea_edit_content_container_content-header-upload-input"
        class="idea_edit_content_container_content-header-upload-label"
      ></label>
      <input
        type="file"
        @change="setFile"
        :accept="item.accept"
        name="idea_edit_content_container_content-header-upload-input"
        id="idea_edit_content_container_content-header-upload-input"
      />
      <div
        class="
          idea_edit_content_container_content-header-upload-selector-item-icon
        "
      >
        <svg
          class="remix menuFile-remix"
          style="margin-right: 10px; width: 20px; height: 20px;font-size:20px"
        >
          <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
        </svg>
      </div>
      <div
        class="
          idea_edit_content_container_content-header-upload-selector-item-text
        "
      >
        {{ $t(item.text) }}
      </div>
    </div>
  </div>
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";
export default {
  methods: {
    selectUploadOption(item, i) {
      this.selectingUploadOption = i;
    },
    setFile(event) {
      const files = event.target.files;
      this.$emit("processFile", files);
    },
  },
  data: () => ({
    remixiconUrl,
    selectingUploadOption: null,
    contentUploadOptions: [
      {
        name: "docx",
        text: "import-docx-file",
        icon: "file-word-2-line",
        accept:
          ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],
  }),
};
</script>

<style scoped lang="scss">
.idea_edit_content_container_content-header-upload-label {
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
}
.idea_edit_content_container_content-header-upload-selector {
  position: fixed;
  min-width: 100px;
  min-height: 40px;
  background: #fff;
  margin-top: 10px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;

  & > .idea_edit_content_container_content-header-upload-selector-item {
    display: flex;
    padding: 5px 10px;
    height: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
    & > .idea_edit_content_container_content-header-upload-selector-item-text {
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #9fa0a0;
      font-weight: normal;
    }
    & > .idea_edit_content_container_content-header-upload-selector-item-icon {
      display: flex;
    }
  }
}
</style>
