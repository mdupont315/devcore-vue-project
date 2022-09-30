<template>
  <div>
    <div v-if="getValue">
      <layer style="z-index: 2" @closed="$emit('input', false)" />
      <div class="image-modal-prompt-wrapper">
        <div class="image-modal-dropzone-wrapper">
          <div
            id="drop_zone"
            @dragover.prevent="onDragOver"
            @drop.prevent
            class="drop-zone"
          >
            <label
              v-if="!draggingFile"
              for="choose_file_dropzone"
              class="choose_file_dropzone_label"
            ></label>
            <input
              v-if="!draggingFile"
              type="file"
              multiple
              @change="setFile"
              name="choose_file_dropzone"
              id="choose_file_dropzone"
            />
            <div @drop="dragFile" class="choose_file_dropzone_dropArea">
              <div class="dropzone-content">
                <div class="dropzone-custom-image">
                  <i
                    class="ri-image-line ri-4x"
                    style="color: #c4c4c4"
                    v-if="fileModalTexts.type === 'preview'"
                  ></i>
                  <!-- <i
                    class="ri-file-word-2-line ri-4x"
                    style="color: #c4c4c4"
                    v-else-if="fileModalTexts.type === 'inline'"
                  ></i> -->
                  <i
                    class="ri-file-3-line ri-4x"
                    style="color: #c4c4c4"
                    v-else
                  ></i>
                </div>
                <div class="dropzone-custom-title">
                  {{ fileModalTexts.primary }}
                </div>
              </div>
            </div>
          </div>
          <div
            class="image-modal-close-container"
            @click="$emit('input', false)"
          >
            <i class="ri-close-line image-modal-close"></i>
          </div>
        </div>

        <div class="dropzone-footer">
          {{ fileModalTexts.secondary }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
    fileModalTexts: {
      type: Object,
      default: () => {},
    },
  },

  data: function () {
    return {
      fileAdded: false,
      draggingFile: false,
    };
  },
  computed: {
    getValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("close", value);
      },
    },
  },
  methods: {
    onDragOver(event) {
      if (!this.draggingFile) {
        this.draggingFile = true;
      }
      event.preventDefault();
    },
    dragFile(event) {
      this.draggingFile = false;
      const files = event.dataTransfer.files;
      this.$emit("setFiles", files);
    },
    setFile(event) {
      const files = event.target.files;

      this.$emit("setFiles", { files, type: this.fileModalTexts.type });
    },
  },
  watch: {
    fileAdded() {
      let that = this;
      setTimeout(function () {
        that.fileAdded = false;
      }, 2000);
    },
    filesAdded() {
      let that = this;
      setTimeout(function () {
        that.filesAdded = false;
      }, 2000);
    },
  },
};
</script>

<style lang="scss">
.dropzone-content {
  max-width: 200px;
}
.dropzone-custom-image {
  text-align: center;
}
.dropzone-custom-title {
  font-family: FuturaLight;
  color: #707070;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
}
.choose_file_dropzone_dropArea {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.choose_file_dropzone_label {
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
}
input[type="file"] {
  display: none;
}
[type="file"] {
  &::file-selector-button {
    display: none;
  }

  // Safari only
  @media not all and (min-resolution: 0.001dpcm) {
    @supports (-webkit-appearance: none) {
      text-indent: -120px;
      margin-left: -7em;

      &::file-selector-button {
        display: inline;
      }
    }
  }
}

.dropzone-custom-content {
  transform: translate(0px, 100px);
}
.dropzone-footer {
  transform: translate(0px, -65px);
  align-self: center;
  color: #c4c4c4;
  font-family: FuturaLight;
  font-size: 16px;
  max-width: 325px;
  margin: auto;
  text-align: center;
}
.image-modal-dropzone-wrapper {
  display: flex;
  height: 100%;
  background: #fff;
  width: 100%;
  flex-direction: row;
  width: 100%;
  border-radius: 3px;
}

.image-modal-dropzone-wrapper > .drop-zone {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.image-modal-close-container {
  border-radius: 50%;
  margin-top: 35px;
  margin-right: 20px;

  display: flex;
  height: 100%;
  display: flex;
  align-self: center;
  justify-content: center;
  text-align-last: center;
  cursor: pointer;
}
.image-modal-close {
  color: lightgray;
  transform: scale(2);
  height: 12px;
  width: 12px;
}

.vue-dropzone {
  border: none;
  width: 100%;
  height: 100%;
}

.image-modal-prompt-wrapper {
  z-index: 2;
  position: absolute;
  width: 484px;
  height: 340px;
  margin: auto;
  position: absolute;
  top: 45%;
  left: 40%;
  margin-top: -50px;
  margin-left: -50px;
  border-radius: 3px;
}
</style>
