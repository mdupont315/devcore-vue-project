import { Node, nodeInputRule } from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";
import { fileWithUniqueName, validateFileSize } from "./helpers/file/fileUtils";

import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import { v4 as uuidv4 } from "uuid";

const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const File = Node.create({
  name: "file",

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
      addFile: () => {},
      removeFile: () => {},
      notify: () => {}
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("size");
        },
        renderHTML: attrs => ({ size: attrs.size })
      },
      href: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("href");
        },
        renderHTML: attrs => ({ href: attrs.href })
      },
      id: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("id");
        },
        renderHTML: attrs => ({ href: attrs.id })
      },
      title: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("title");
        },
        renderHTML: attrs => ({ title: attrs.title })
      },
      style: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("style");
        },
        renderHTML: attrs => ({ style: attrs.style })
      },
      type: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("type");
        },
        renderHTML: attrs => ({ type: attrs.type })
      },
      preview: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("preview");
        },
        renderHTML: attrs => ({ preview: attrs.preview })
      },
      src: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("src");
        },
        renderHTML: attrs => ({ src: attrs.src })
      },
      uuid: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("uuid");
        },
        renderHTML: attrs => ({ uuid: attrs.uuid })
      },
      height: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("height");
        },
        renderHTML: attrs => ({ uuid: attrs.height })
      }
    };
  },

  parseHTML: () => [
    {
      tag: "img[src]",
      getAttrs: dom => {
        if (typeof dom === "string") return {};
        const obj = {
          id: dom.getAttribute("id"),
          src: dom.getAttribute("src"),
          size: dom.getAttribute("size"),
          title: dom.getAttribute("title") ?? 'no-name',
          alt: dom.getAttribute("alt"),
          style: dom.getAttribute("style"),
          type: dom.getAttribute("type"),
          preview: dom.getAttribute("preview"),
          uuid: dom.getAttribute("uuid"),
          height: dom.getAttribute("height"),
        };
        if (obj.src) return obj;
      }
    },
    {
      tag: "a",
      getAttrs: dom => {
        if (typeof dom === "string") return {};
        const obj = {
          id: dom.getAttribute("id"),
          src: dom.getAttribute("src"),
          size: dom.getAttribute("size"),
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title") ?? 'no-name',
          style: dom.getAttribute("style"),
          type: dom.getAttribute("type"),
          preview: dom.getAttribute("preview"),
          uuid: dom.getAttribute("uuid")
        };
        if (obj.href) return obj;
      }
    }
  ],
  renderHTML: ({ HTMLAttributes }) => {
    const {
      href,
      title,
      src,
      alt,
      style,
      preview,
      size,
      uuid
    } = HTMLAttributes;

    if (href || src) {
      if (!preview) {
        return ["a", { href, title, style, size, alt, uuid }, title];
      } else {
        return ["img", { title, src, alt, style, size, uuid }];
      }
    }

    return false;
  },
  addNodeView() {
    return VueNodeViewRenderer(FileNodeView);
  },

  addCommands() {
    const { addFile, notify } = this.options;
    return {
      setImage: attrs => ({ view, tr }) => {
        let pos = 1;
        if (tr && tr.curSelection && tr.curSelection.$head) {
          pos = tr.curSelection.$head.pos;
        }
        const coordinates = { pos, inside: 0 };
        const input = attrs ? attrs : [];
        const files = Array.from(input);
        const previewFiles = files.filter(file => /image/i.test(file.type));
        const nonPreviewFiles = files.filter(file => !/image/i.test(file.type));

        if (previewFiles.length > 0) {
          previewFiles.forEach(async item => {
            const preview = true;
            const valid = validateFileSize(notify, item);
            if (valid) {
              const transformedFile = await fileWithUniqueName(view, item);
              const uuid = uuidv4();
              addFile({ uuid, file: transformedFile });
              renderFileInBase64ToCoordinates(
                transformedFile,
                view,
                coordinates,
                preview,
                uuid
              );
            }
          });
        }

        if (nonPreviewFiles.length > 0) {
          nonPreviewFiles.forEach(async item => {
            const preview = false;
            const valid = validateFileSize(notify, item);
            if (valid) {
              const transformedFile = await fileWithUniqueName(view, item);
              const uuid = uuidv4();
              addFile({ uuid, file: transformedFile });
              renderFileInBase64ToCoordinates(
                transformedFile,
                view,
                coordinates,
                preview,
                uuid
              );
            }
          });
        }
      },
      removeFile: file => () => {
        const { removeFile } = this.options;
        removeFile?.(file);
      }
    };
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: IMAGE_INPUT_REGEX,
        type: this.type,
        getAttributes: match => {
          const [, , alt, src, title] = match;

          return { src, alt, title };
        }
      })
    ];
  },
  addProseMirrorPlugins() {
    const { addFile } = this.options;
    const { notify } = this.options;
    return [uploadFilePlugin(addFile, notify)];
  }
});
