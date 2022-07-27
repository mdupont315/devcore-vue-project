<template>
  <node-view-wrapper as="div" class="file-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-file">
      <div
        v-if="getAttrs.preview"
        style="display: flex; flex-direction: column"
      >
        <div style="margin-right: 5px; margin-bottom: 10px">
          <img
            :ref="`${getAttrs.uuid}`"
            :src="getAttrs.src"
            :alt="getAttrs.title"
            @load="loadedImg"
            style="max-height: 65vh; max-width: 50%"
            :style="{ width: imgWidth, height: imgHeight }"
          />
          <!--             style="width: 30%; height: 30%" -->
        </div>
        <button @click="remove" class="file-remove-button">
          {{ $t("Remove") }}
        </button>
      </div>

      <div v-else style="display: flex">
        <div style="display: flex; place-items: center">
          <b-tooltip
            :disabled="!!getAttrs.href === false"
            ref="tooltip"
            :target="`attachment-file-non-preview-container-${getAttrs.title}`"
          >
            {{ $t("Download file") }}
          </b-tooltip>
          <div
            class="attachment-file-non-preview-container"
            :id="`attachment-file-non-preview-container-${getAttrs.title}`"
            :class="
              !!getAttrs.href === true
                ? 'is_uploaded_file'
                : 'is_not_uploaded_file'
            "
          >
            <a :href="getAttrs.href">
              <svg
                width="17"
                height="12"
                viewBox="0 0 17 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8436 4.27826C15.7045 4.10435 15.5132 4 15.3045 4H14.4349V2.10435C14.4349 1.77391 14.1914 1.56522 13.861 1.56522H7.77405L6.99144 0.278261C6.88709 0.104348 6.6784 0 6.4697 0H1.98274C1.65231 0 1.39144 0.191304 1.39144 0.521739V4H0.695787C0.487092 4 0.278396 4.10435 0.156657 4.26087C0.0349179 4.41739 -0.0346474 4.64348 0.0175266 4.85217L1.30448 10.7478C1.37405 11.0609 1.65231 11.3043 1.98274 11.3043H13.861C14.174 11.3043 14.4523 11.0783 14.5393 10.7826L15.9827 4.86957C16.0349 4.66087 15.9827 4.45217 15.8436 4.27826ZM2.60883 1.21739H6.12188L6.90448 2.50435C7.00883 2.67826 7.21753 2.78261 7.42622 2.78261H13.2175V4H2.60883V1.21739ZM13.3045 9.91304H2.53927L1.56535 5.3913H14.4175L13.3045 9.91304Z"
                  fill="#4294D0"
                />
              </svg>

              <span style="margin-left: 10px">{{ getAttrs.title }}</span></a
            >
          </div>
          <button
            @click="remove"
            v-b-tooltip.hover
            :title="$t('Remove file')"
            class="file-remove-button"
            style="margin-left: 8px; height: 100%"
          >
            {{ $t("Remove") }}
          </button>
        </div>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import { FolderIcon } from "@/assets";
import { PREVIEW_MAX_WIDTH_OF_VIEWPORT } from "./helpers/file/constants";
import { v4 as uuidv4 } from "uuid";
import {
  base64Resize,
  isValidExternalUrl,
  getBase64FromUrl,
  base64MimeType
} from "./helpers/file/fileUtils";

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,

  content: "inline*",

  data() {
    return {
      FolderIcon,
      disableTooltip: false,
      resizedImages: [],
      imgWidth: "50%",
      imgHeight: "auto",
    };
  },

  computed: {
    fileEntity() {
      const stringFileEntity = this.node?.attrs;
      return stringFileEntity;
    },
    getAttrs() {
      return this.fileEntity;
    },
  },
  async mounted() {
    const isStagedPreviewFile =
      !this.node.attrs.href && this.node.attrs.src && !this.node.attrs.id;

    if (isStagedPreviewFile) {
      if (isValidExternalUrl(this.node.attrs.src)) {
        await this.transformFilesIfPastedExternalUrls();
      }
    }
  },
  beforeDestroy() {
    this.editor.commands.removeFile(this.fileEntity);
  },
  methods: {
    async addBase64AsFile(dataUrl, type) {
      const toFile = await fetch(dataUrl);
      const blob = await toFile.blob();

      const file = new File([blob], this.node.attrs.title, {
        type: type,
      });

      this.extension.options.addFile({
        uuid: this.node.attrs.uuid ?? uuidv4(),
        file: file,
      });
    },
    async resizeImage() {
      const isStagedFile =
        !this.node.attrs.href && this.node.attrs.src && !this.node.attrs.id;
      if (!isStagedFile) return;

      const dataUrl = this.getAttrs.src;
      const type = this.node.attrs.type ?? base64MimeType(dataUrl);

      if (this.resizedImages.includes(this.node.attrs.uuid)) {
        return;
      }

      const mod = dataUrl.slice(-2) === "==" ? 2 : 1;
      const size = dataUrl.length * (3 / 4) - mod;

      const callback = async (dataUrl) => {
        this.updateAttributes({
          src: dataUrl,
          preview: true,
          size,
          type,
        });

        await this.addBase64AsFile(dataUrl, type);
      };
      await this.handleResizedImage(dataUrl, type, callback);
      this.resizedImages.push(this.node.attrs.uuid);
    },
    async loadedImg(e) {
      await this.resizeImage();

      const { clientHeight: domHeight } = this.editor.view.dom.parentElement;
      const { clientHeight } = e.path[0];
      const allowedMaxHeight = domHeight * 0.9;

      if (clientHeight > allowedMaxHeight) {
        this.imgWidth = "auto";
        this.imgHeight = "80vh";
      }
    },

    async handleResizedImage(dataUrl, type, callback) {
      const scaleWidthUntilPX =
        this.$el.clientWidth * PREVIEW_MAX_WIDTH_OF_VIEWPORT;
      base64Resize(dataUrl, scaleWidthUntilPX, type, callback);
    },
    async transformFilesIfPastedExternalUrls() {
      const size = this.node.attrs.size;
      if (!size || typeof size === "string") {
        if (!this.node.attrs.src) return;
        let externalToBase64 = "";
        try {
          externalToBase64 = await getBase64FromUrl(this.node.attrs.src);
        } catch (e) {
          console.log(e);
          this.extension.options.notify("Copying content prohibited", {
            site: this.node.attrs.src,
          });
          this.deleteNode();
          return;
        }

        const type = this.node.attrs.type ?? base64MimeType(externalToBase64);

        const mod = externalToBase64.slice(-2) === "==" ? 2 : 1;
        const size = externalToBase64.length * (3 / 4) - mod;

        const isGif = type === "image/gif";

        if (isGif) {
          this.updateAttributes({
            src: externalToBase64,
            type,
            preview: true,
            size,
          });
          this.resizedImages.push(this.node.attrs.uuid);
          return await this.addBase64AsFile(externalToBase64, type);
        }

        const callback = async (dataUrl) => {
          this.updateAttributes({
            src: dataUrl,
            type,
            preview: true,
            size,
          });
          await this.addBase64AsFile(dataUrl, type);
        };
        this.resizedImages.push(this.node.attrs.uuid);

        return await this.handleResizedImage(externalToBase64, type, callback);
      }
    },
    remove() {
      const { editor, getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      editor.commands.deleteRange({ from, to });
    },
  },
};
</script>

<style lang="scss">
.file-component {
  padding-top: 3px;
  padding-bottom: 3px;
  .file-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 60px;
    outline: none;
    position: relative;
    border-radius: 3px;
    background: #fff;
    bottom: 2px;
    cursor: pointer;
    &:hover {
      background: #d0424d;
      color: #fff;
    }
  }
  .file-remove-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    position: absolute;
  }
}

.attachment-file-non-preview-container {
  bottom: 2px;
  font-family: "FuturaMedium";
  height: 40px;
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  border: 1px solid lightgray;
  padding: 2px 10px;
  border-radius: 3px;
  padding: 0 10px;
  user-select: none;
  cursor: pointer;
  background: #fff;
  > a {
    &:not([href]) {
      color: lightgray;
      > svg > path {
        fill: lightgray;
      }
    }
    color: #4294d0;
    > svg > path {
      fill: #4294d0;
    }
  }
}

.attachment-file-non-preview-container.is_not_uploaded_file:hover {
  background: #fff;
  > a {
    color: lightgray;
    > svg > path {
      fill: lightgray;
    }
  }
}
.attachment-file-non-preview-container:hover {
  background: #4294d0;
  > a {
    color: #fff;
    > svg > path {
      fill: #fff;
    }
  }
}
</style>