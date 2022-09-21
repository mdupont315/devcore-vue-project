<template>
  <node-view-wrapper as="div" class="file-component">
    <node-view-content class="content-dom" />

    <section class="content-dom-file">
      <div
        v-if="getAttrs.preview"
        style="display: flex; flex-direction: column"
      >
        <div class="content-dom-file-image-container">
          <!--   -->
          <img
            :key="imgKey"
            :ref="`${getAttrs.uuid}`"
            :src="getAttrs.src"
            :alt="getAttrs.title"
            :style="{ width: `${imgWidth}px`, height: `${imgHeight}px` }"
            class="fileNodeView-preview-image"
            @load="onImgLoad"
            loading="lazy"
          />

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
  base64MimeType,
  isBase64,
} from "./helpers/file/fileUtils";
import ImageResizer from "@/lib/image-resizer";

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
      imgWidth: 0,
      imgHeight: 0,
      resizerInstance: new ImageResizer(),
      resized: false,
      imgKey: Math.random(),
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
    //  console.log(this.getAttrs);

    // if (!this.getAttrs.src && !this.getAttrs.href) {
    // 	console.log("delete")
    //   this.deleteNode();
    // }

    const isStagedPreviewFile =
      !this.getAttrs.href && this.getAttrs.src && !this.getAttrs.id;

    // update attrs

    const isExternalUrl = isValidExternalUrl(this.getAttrs.src);
    const isCopyPastedBase64 = isBase64(this.getAttrs.src);

    if (isStagedPreviewFile) {
      if (isExternalUrl || isCopyPastedBase64) {
        // console.log("TRANSFORMIN");
        await this.handleExternalFiles();
      }
    }
  },
  beforeDestroy() {
    this.removeFile();
  },
  methods: {
    onImgLoad(e) {
      console.log("restrict dimensions");
      console.log(e);
      const imgEl = e.path[0];
      if (imgEl && imgEl.localName === "img") {
        const { naturalHeight: imgHeight, naturalWidth: imgWidth } = imgEl;
        const { clientHeight: viewportHeight, clientWidth: viewportWidth } =
          this.editor.view.dom.parentElement;
        const hasParent = e.path[1] && e.path[1].localName === "div";
        if (hasParent) {
          console.log({ viewportHeight });
          console.log({ viewportWidth });
          const MAX_IMG_WIDTH = viewportWidth / 2;
          const MAX_IMG_HEIGHT = viewportHeight - 100;

          const RATIO_WIDTH = imgWidth / MAX_IMG_WIDTH;
          const RATIO_HEIGHT = imgHeight / MAX_IMG_HEIGHT;

          const RATIO_ASPECT =
            RATIO_WIDTH > RATIO_HEIGHT ? RATIO_WIDTH : RATIO_HEIGHT;
          console.log(imgWidth / RATIO_ASPECT);
          console.log(imgHeight / RATIO_ASPECT);

          this.imgWidth = imgWidth / RATIO_ASPECT;
          this.imgHeight = imgHeight / RATIO_ASPECT;
          if (!this.resized) {
            this.resized = true;
            this.imgKey = Math.random();
          }
        }
      }
    },
    async addBase64AsFile(dataUrl, type) {
      const toFile = await fetch(dataUrl, {
        method: "GET",
        mode: "no-cors",
      });
      const blob = await toFile.blob();

      // 	 const image = new Image();
      // 	 let width, height;

      //  image.src = dataUrl;

      //  const loadedDimensions = new Promise((resolve, reject) => {
      // 	 			 image.onload = () => {
      // 						resolve({
      // 							width: image.width,
      // 							height: image.height
      // 						})

      //  }

      // image.onload = () => {
      const fileType = toFile?.url.split(";")[0].split("/")[1] || "png";
      const title = `${uuidv4()}.${fileType}`;

      const file = new File([blob], this.getAttrs.title ?? title, {
        type,
        lastModified: Date.now(),
      });

      this.extension.options.addFile({
        uuid: this.getAttrs.uuid,
        file: file,
      });

      //TODO: Figure out base64str real dimensions and set them below
      // if null values => does .txt files

      // this.resizerInstance.resize(
      //   new File([blob], this.getAttrs.title ?? title, {
      //     type,
      //   }),
      //   {
      //     height: this.getAttrs.dimensions?.height || 500,
      //     width: this.getAttrs.dimensions?.width || 500,
      //   },
      //   (blob) => {
      //     var file = new File([blob], this.getAttrs.title ?? title, {
      //       type,
      //       lastModified: Date.now(),
      //     });
      //     // addFile({ uuid: uuidv4(), file: file });
      //     this.extension.options.addFile({
      //       uuid: this.getAttrs.uuid ?? uuidv4(),
      //       file: file,
      //     });
      //   }
      // );
      //   };
    },
    // async resizeImage(e) {
    //   //	TODO: Figure out image dimensions here... scale big image

    //   console.log(this.getAttrs);
    //   //	console.log(this.getAttrs.src)
    //   const isStagedFile =
    //     !this.getAttrs.href && this.getAttrs.src && !this.getAttrs.id;
    //   if (!isStagedFile) return;

    //   const dataUrl = this.getAttrs.src;
    //   const type = this.getAttrs.type ?? base64MimeType(dataUrl);

    //   if (this.resizedImages.includes(this.getAttrs.uuid)) {
    //     return;
    //   }

    //   const mod = dataUrl.slice(-2) === "==" ? 2 : 1;
    //   const size = dataUrl.length * (3 / 4) - mod;

    //   const callback = async (dataUrl) => {
    //     this.updateAttributes({
    //       src: dataUrl,
    //       preview: true,
    //       size,
    //       type,
    //     });

    //     await this.addBase64AsFile(dataUrl, type);
    //   };
    //   await this.handleResizedImage(dataUrl, type, callback);
    //   this.resizedImages.push(this.getAttrs.uuid);
    // },
    //   async loadedImg(e) {
    //     console.log(e);
    // //    await this.resizeImage();
    //     if (!this.editor || !this.editor.view.dom.parentElement) return;
    //     const { clientHeight: domHeight } = this.editor.view.dom.parentElement;
    //     const { clientHeight } = e.path[0];
    //     const allowedMaxHeight = domHeight * 0.9;

    //     if (clientHeight > allowedMaxHeight) {
    //       this.imgWidth = "auto";
    //       this.imgHeight = "80vh";
    //     }
    //   },

    async handleResizedImage(dataUrl, type, callback) {
      const scaleWidthUntilPX =
        this.$el.clientWidth * PREVIEW_MAX_WIDTH_OF_VIEWPORT;
      base64Resize(dataUrl, scaleWidthUntilPX, type, callback);
    },
    async handleExternalFiles() {
      const size = this.getAttrs.size;

      //console.log(size);
      // if (!size || typeof size === "string") {
      if (!this.getAttrs.src) return;
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

      const fileType = externalToBase64.split(";")[0].split("/")[1] || "png";
      const mod = externalToBase64.slice(-2) === "==" ? 2 : 1;
      const base64size = externalToBase64.length * (3 / 4) - mod;
      const uuid = uuidv4();
      this.updateAttributes({
        title: `${uuid}.${fileType}`,
        src: externalToBase64,
        preview: true,
        size: base64size,
        uuid,
      });

      const type = this.getAttrs.type ?? base64MimeType(externalToBase64);
      await this.addBase64AsFile(externalToBase64, type);

      //   console.log(externalToBase64 && this.getAttrs.title);

      //   if (externalToBase64 && !this.getAttrs.title) {
      //     const fileType =
      //       externalToBase64.split(";")[0].split("/")[1] || "png";
      //     const uuid = uuidv4();
      //     this.updateAttributes({
      //       title: `${uuid}.${fileType}`,
      //       uuid,
      //     });
      //   }

      //   const type = this.getAttrs.type ?? base64MimeType(externalToBase64);

      //   console.log(type);

      //   const mod = externalToBase64.slice(-2) === "==" ? 2 : 1;
      //   const size = externalToBase64.length * (3 / 4) - mod;

      //   const isGif = type === "image/gif";

      //   if (isGif) {
      //     this.updateAttributes({
      //       src: externalToBase64,
      //       type,
      //       preview: true,
      //       size,
      //     });
      //     this.resizedImages.push(this.getAttrs.uuid);
      //     return await this.addBase64AsFile(externalToBase64, type);
      //   }

      //   const callback = async (dataUrl) => {
      //     this.updateAttributes({
      //       src: dataUrl,
      //       type,
      //       preview: true,
      //       size,
      //     });
      //     await this.addBase64AsFile(dataUrl, type);
      //   };
      //   this.resizedImages.push(this.getAttrs.uuid);

      //   return await this.handleResizedImage(externalToBase64, type, callback);
      // }
    },
    removeFile() {
      this.editor.commands.removeFile(this.fileEntity);
      // const isUploaded =
      //   (this.getAttrs.src || this.getAttrs.href) && this.getAttrs.id;

      // if (isUploaded) {
      //   this.editor.commands.removeFile(this.fileEntity);
      // }
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
.content-dom-file-image-container {
  margin-right: 5px;
  margin-bottom: 10px;
}
.fileNodeView-preview-image {
  /* IE, only works on <img> tags */
  -ms-interpolation-mode: nearest-neighbor;
  /* Firefox */
  image-rendering: crisp-edges;
  /* Chromium + Safari */
  image-rendering: pixelated;
}
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
