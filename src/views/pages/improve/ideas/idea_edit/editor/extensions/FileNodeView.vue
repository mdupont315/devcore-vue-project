<template>
  <node-view-wrapper as="div" class="file-component" contenteditable="false">
    <node-view-content class="content-dom" />

    <section class="content-dom-file">
      <div v-if="isAttachmentFile" style="display: flex">
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
            @click="removeNode"
            v-b-tooltip.hover
            :title="$t('Remove file')"
            class="file-remove-button"
            style="margin-left: 8px; height: 100%"
          >
            {{ $t("Remove") }}
          </button>
        </div>
      </div>
      <div v-else style="display: flex; flex-direction: column">
        <div class="content-dom-file-image-container" v-lazyload>
          <!--   -->
          <div class="fileNodeView-lazy-load-image-spinner">
            <b-spinner />
          </div>
          <img
            :key="imgKey"
            :ref="`file-image-node-${imgKey}`"
            :data-url="getAttrs.src"
            class="fileNodeView-preview-image"
          />

          <!-- <img
            :key="imgKey"
            :ref="`${getAttrs.uuid}`"
            :data-url="getAttrs.src"
            :alt="getAttrs.title"
            :style="{ width: `${imgWidth}px`, height: `${imgHeight}px` }"
            class="fileNodeView-preview-image"
						    @load="onImgLoad"

          /> -->

          <!-- <img
            :ref="`${getAttrs.uuid}`"
            :src="getAttrs.src"
            :alt="getAttrs.title"
            @load="loadedImg"
            style="max-height: 65vh; max-width: 50%"
          /> -->
        </div>
        <button @click="removeNode" class="file-remove-button">
          {{ $t("Remove") }}
        </button>
      </div>
    </section>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from "@tiptap/vue-2";
import { FolderIcon } from "@/assets";
import LazyLoadDirective from "./helpers/file/editorimage.directive";
import { v4 as uuidv4 } from "uuid";
import {
  isValidExternalUrl,
  getBase64FromUrl,
  base64MimeType,
  isBase64,
} from "./helpers/file/fileUtils";

export default {
  directives: {
    lazyload: LazyLoadDirective,
  },
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
      imgWidth: "auto",
      imgHeight: "auto",
      resized: false,
      name: null,
      imgKey: Math.random(),
      nameSet: false,
    };
  },

  computed: {
    // imageElementSrcAttribute() {
    //   const image = this.$refs[`file-image-node-${this.imgKey}`];
    //   return !!image.src;
    // },
    isAttachmentFile() {
      return this.getAttrs["data-type"] === "link" && !this.getAttrs.preview;
    },
    fileEntity() {
      const stringFileEntity = this.node?.attrs;
      return stringFileEntity;
    },
    getAttrs() {
      return this.fileEntity;
    },
  },

  async mounted() {
    if (!this.getAttrs.src && !this.getAttrs.href) {
      this.deleteNode();
    }

    const isStagedPreviewFile =
      !this.getAttrs.href && this.getAttrs.src && !this.getAttrs.id;

    const isUploadedImage = this.getAttrs.src?.includes(process.env.BASE_URL);
    const isUploadedFile = this.getAttrs.href?.includes(process.env.BASE_URL);
    const isProdUploadedFile = this.getAttrs.src?.includes(
      "https://devcore.app"
    );
    const isStageUploadedFile = this.getAttrs.src?.includes(
      "https://stage.devcore.app"
    );

    // console.log(isUploadedImage);
    // console.log(isUploadedFile);

    const isExternalUrl =
      isValidExternalUrl(this.getAttrs.src) &&
      !isUploadedImage &&
      !isUploadedFile &&
      !isProdUploadedFile &&
      !isStageUploadedFile;

    // console.log(process.env.BASE_URL);

    if (isStagedPreviewFile) {
      if (isExternalUrl || isBase64(this.getAttrs.src)) {
        await this.handleExternalFiles();
      }
    }
  },

  methods: {
    parseUuid(name) {
      // if (name && name.length > 40) {
      //   const extension = getExtension(this.getAttrs.title);
      //   const fileName = getFileName(this.getAttrs.title);
      //   return `${fileName.substring(0, fileName.length - 37)}.${extension}`;
      // }
      if (this.getAttrs.uuid) {
        return name.replace(this.getAttrs.uuid, "");
      }
      return name;
    },
    onImgLoad(e) {
      const imgEl = e.path[0];
      if (imgEl && imgEl.localName === "img") {
        const { naturalHeight: imgHeight, naturalWidth: imgWidth } = imgEl;
        const { clientHeight: viewportHeight, clientWidth: viewportWidth } =
          this.editor.view.dom.parentElement;

        const hasParent = e.path[1] && e.path[1].localName === "div";
        if (hasParent) {
          const MAX_IMG_WIDTH = viewportWidth / 2;
          const MAX_IMG_HEIGHT = viewportHeight - 100;

          const RATIO_WIDTH = imgWidth / MAX_IMG_WIDTH;
          const RATIO_HEIGHT = imgHeight / MAX_IMG_HEIGHT;

          const RATIO_ASPECT =
            RATIO_WIDTH > RATIO_HEIGHT ? RATIO_WIDTH : RATIO_HEIGHT;

          this.imgWidth = imgWidth / RATIO_ASPECT;
          this.imgHeight = imgHeight / RATIO_ASPECT;
          if (this.imgWidth === 0 || this.imgHeight === 0) {
            this.deleteNode();
          }
          if (!this.resized) {
            this.resized = true;
            this.imgKey = Math.random();
          }
        }
      }
    },
    async addBase64AsFile() {
      //  console.log("ADDING TYPE");
      const toFile = await fetch(this.getAttrs.src, {
        method: "GET",
        mode: "no-cors",
      });
      const blob = await toFile.blob();

      const fileType = this.getAttrs.src.split(";")[0].split("/")[1] || "jpg";
      const title = `${this.getAttrs.uuid}.${fileType}`;

      const file = new File([blob], this.getAttrs.title ?? title, {
        type: this.getAttrs.type,
        lastModified: Date.now(),
      });

      // console.log(this.getAttrs);

      this.extension.options.addFile({
        uuid: this.getAttrs.uuid,
        file: file,
      });
    },

    // async handleResizedImage(dataUrl, type, callback) {
    //   const scaleWidthUntilPX =
    //     this.$el.clientWidth * PREVIEW_MAX_WIDTH_OF_VIEWPORT;
    //   base64Resize(dataUrl, scaleWidthUntilPX, type, callback);
    // },
    async handleExternalFiles() {
      //console.log(size);
      // if (!size || typeof size === "string") {

      const size = this.node.attrs.size;
      if (size || typeof size === "string") return;
      if (this.resizedImages.includes(this.node.attrs.uuid)) {
        return;
      }

      if (!this.getAttrs.src || this.isAttachmentFile) return;

      let externalToBase64 = "";
      try {
        externalToBase64 = await getBase64FromUrl(this.getAttrs.src);
      } catch (e) {
        console.log(e);
        this.extension.options.notify("Copying content prohibited", {
          site: this.getAttrs.src,
        });
        return this.deleteNode();
      }

      //  console.log({ externalToBase64 });

      //  console.log("*****");
      //  console.log(this.node.attrs);
      const type = this.getAttrs.type ?? base64MimeType(externalToBase64);

      const fileType = externalToBase64.split(";")[0].split("/")[1] || "png";
      const mod = externalToBase64.slice(-2) === "==" ? 2 : 1;
      const base64size = externalToBase64.length * (3 / 4) - mod;
      if (externalToBase64) {
        const uuid = uuidv4();
        this.updateAttributes({
          title: `${uuid}.${fileType}`,
          src: externalToBase64,
          type,
          "data-type": "image",
          size: base64size,
          uuid: this.getAttrs.uuid ?? uuid,
        });
      }

      await this.addBase64AsFile();
      // await this.addBase64AsFile(externalToBase64, type);

      // const callback = async (dataUrl) => {
      //   this.updateAttributes({
      //     src: dataUrl,
      //     type,
      //     preview: true,
      //     size,
      //   });
      //   await this.addBase64AsFile(dataUrl, type);
      // };
      // }
      // const callback = async (dataUrl) => {
      //   this.updateAttributes({
      //     src: dataUrl,
      //     type,
      //     preview: true,
      //     size: base64size,
      //   });
      //   await this.addBase64AsFile(dataUrl, type);
      // };
      // this.resizedImages.push(this.node.attrs.uuid);

      //   return await this.handleResizedImage(externalToBase64, type, callback);
    },
    removeFile() {
      this.editor.commands.removeFile(this.fileEntity);
    },
    removeNode() {
      const { editor, getPos, node } = this;

      const from = getPos();
      const to = from + node.nodeSize;

      this.removeFile();

      editor.commands.deleteRange({ from, to });
    },
  },
};
</script>

<style lang="scss">
.fileNodeView-lazy-load-image-spinner {
  display: flex;
  width: 200px;
  height: 200px;
  align-items: center;
  margin-left: 10%;
}
.content-dom-file-image-container {
  margin-right: 5px;
  margin-bottom: 10px;
}
// .fileNodeView-preview-image {
//   /* IE, only works on <img> tags */
//   -ms-interpolation-mode: nearest-neighbor;
//   /* Firefox */
//   image-rendering: crisp-edges;
//   /* Chromium + Safari */
//   image-rendering: pixelated;
// }
.file-component {
  padding-top: 3px;
  padding-bottom: 3px;
  .file-remove-button {
    font-family: "FuturaMedium";
    color: #d0424d;
    border: 1px solid lightgray;
    width: 65px;
    outline: none;
    position: relative;
    font-size: 14px;
    font-weight: 400;
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
  font-size: 14px;
  font-weight: 400;
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
