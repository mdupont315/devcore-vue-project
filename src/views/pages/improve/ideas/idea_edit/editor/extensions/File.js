import { Node, nodeInputRule } from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";
import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";

const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const File = Node.create({
  name: "file",

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
      addFile: () => {},
      removeFile: () => {}
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
          return el.getAttribute("title");
        },
        renderHTML: attrs => ({ size: attrs.size })
      },
      href: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("title");
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
      }
    };
  },
  // parseHTML() {
  //   return [{ tag: "span[file]" }];
  // },
  parseHTML: () => [
    {
      tag: "img[src]",
      getAttrs: dom => {
        if (typeof dom === "string") return {};
        const obj = {
          id: dom.getAttribute("id"),
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt"),
          style: dom.getAttribute("style"),
          type: dom.getAttribute("type"),
          preview: dom.getAttribute("preview")
        };
        return obj;
      }
    },
    {
      tag: "a",
      getAttrs: dom => {
        if (typeof dom === "string") return {};
        const obj = {
          id: dom.getAttribute("id"),
          src: dom.getAttribute("src"),
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title"),
          style: dom.getAttribute("style"),
          type: dom.getAttribute("type"),
          preview: dom.getAttribute("preview")
        };
        return obj;
      }
    }
  ],
  renderHTML: ({ HTMLAttributes }) => {
    const { href, title, src, alt, style, preview } = HTMLAttributes;

    if (!preview) {
      return ["a", { href, title, style }, title];
    }
    return ["img", { title, src, alt, style }];
  },
  addNodeView() {
    return VueNodeViewRenderer(FileNodeView);
  },

  addCommands() {
    console.log(this.options);
    const { addFile } = this.options;
    return {
      setImage: attrs => ({ view, tr }) => {
        console.log("SETTING IMAGE ");
        let pos = 1;
        if (tr && tr.curSelection && tr.curSelection.$head) {
          pos = tr.curSelection.$head.pos;
        }
        const coordinates = { pos, inside: 0 };
        const input = attrs ? attrs : [];
        const files = Array.from(input);
        const previewFiles = files.filter(file => /image/i.test(file.type));

        if (previewFiles.length > 0) {
          previewFiles.forEach(async item => {
            const preview = true;
            addFile(item);
            renderFileInBase64ToCoordinates(item, view, coordinates, preview);
          });
        } else {
          files.forEach(async item => {
            const preview = false;
            addFile(item);
            renderFileInBase64ToCoordinates(item, view, coordinates, preview);
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
    return [uploadFilePlugin(addFile)];
  }
});
