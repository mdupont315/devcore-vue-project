import { Node, nodeInputRule } from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";
import { fileWithUniqueName, validateFileSize } from "./helpers/file/fileUtils";

import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import { v4 as uuidv4 } from "uuid";
// import { generateJSON } from '@tiptap/html'
const mammoth = require("mammoth");
const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const File = Node.create({
  name: "file",

  //priority: 1000,

  addOptions() {
    return {
      inline: true,
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
      'data-type': {
        default: null,
        parseHTML: el => {
          return el.getAttribute("data-type");
        },
        renderHTML: attrs => ({ type: attrs['data-type'] })
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
      uri: {
        default: null,
        parseHTML: el => {
          return el.getAttribute("uri");
        },
        renderHTML: attrs => ({ uri: attrs.uri })
      }
    };
  },

  parseHTML: () => [
    // {
    //   tag: "p img[src]",
    //   getAttrs: dom => dom.src && null
    // },
    // {
    //   tag: "p > img[src]",
    //   getAttrs: dom => {
    //     if (typeof dom === "string") return {};
    //     const obj = {
    //       id: dom.getAttribute("id"),
    //       src: dom.getAttribute("src"),
    //       size: dom.getAttribute("size"),
    //       title: dom.getAttribute("title"),
    //       alt: dom.getAttribute("alt"),
    //       style: dom.getAttribute("style"),
    //       type: dom.getAttribute("type"),
    //       preview: dom.getAttribute("preview") || true,
    //       uuid: dom.getAttribute("uuid"),
    //       dimensions: dom.getAttribute("dimensions")
    //     };
    //     if (obj.src) {
    //       console.log("obj");
    //       return obj;
    //     }
    //   }
    // },
    {
      tag: "img[src]",
      getAttrs: dom => !!dom.src && null
      // tag: "img[src]",
      // getAttrs: dom => {
      //   console.log(!!dom.src)
      //   console.log(dom.src)
      //   if (typeof dom === "string") return {};
      //   const obj = {
      //     id: dom.getAttribute("id"),
      //     src: dom.getAttribute("src"),
      //     size: dom.getAttribute("size"),
      //     title: dom.getAttribute("title"),
      //     alt: dom.getAttribute("alt"),
      //     style: dom.getAttribute("style"),
      //     type: dom.getAttribute("type"),
      //     preview: dom.getAttribute("preview"),
      //     uuid: dom.getAttribute("uuid"),
      //     dimensions: dom.getAttribute("dimensions")
      //   };
      //   if (obj.src) return obj;
      // }
    },
    // {
    //   tag: "a",
    //   getAttrs: dom => !!dom.href && null
    //   // tag: "a",
    //   // getAttrs: dom => {
    //   //   if (typeof dom === "string") return {};
    //   //   const obj = {
    //   //     id: dom.getAttribute("id"),
    //   //     src: dom.getAttribute("src"),
    //   //     size: dom.getAttribute("size"),
    //   //     href: dom.getAttribute("href"),
    //   //     title: dom.getAttribute("title"),
    //   //     style: dom.getAttribute("style"),
    //   //     type: dom.getAttribute("type"),
    //   //     preview: dom.getAttribute("preview"),
    //   //     uuid: dom.getAttribute("uuid"),
    //   //     dimensions: dom.getAttribute("dimensions")
    //   //   };
    //   //   if (obj.href) return obj;
    //   // }
    // },
    {
      tag: "file-component",
      getAttrs: dom => {
        console.log(dom);
        return dom && null;
      }
    }
  ],
  renderHTML: ({ HTMLAttributes }) => {
    const {
      href,
      title,
      src,
      preview,
      uuid
    } = HTMLAttributes;

    console.log({ HTMLAttributes });

    // return [
    //   "file-component",
    //   { title, src, href, style, size, uuid, name, preview }
    // ];

    console.log(HTMLAttributes);
    return ["file-component", { title, src,uuid, href, preview, 'data-type': HTMLAttributes['data-type'] }];
    // if (href || src) {
    //   if (preview) {
    //     return [
    //       "img",
    //       { title, src, size, uuid, preview }
    //     ];
    //   } else {
    //     return ["a", { href, title, size, uuid, preview }, title];
    //   }
    // }

  //  return true;
  },
  addNodeView() {
    return VueNodeViewRenderer(FileNodeView);
  },

  addCommands() {
    const { addFile, notify } = this.options;
    return {
      setInlineFile: attrs => ({ view, tr }) => {
        let pos = 1;
        if (tr && tr.curSelection && tr.curSelection.$head) {
          pos = tr.curSelection.$head.pos;
        }
        const input = attrs ? attrs : [];
        const files = Array.from(input);
        const nonPreviewFiles = files.filter(file => !/image/i.test(file.type));
        let content = null;

        let that = this;

        if (nonPreviewFiles.length > 0) {
          nonPreviewFiles.forEach(async item => {
            var reader = new FileReader();

            reader.onloadend = function(event) {
              var arrayBuffer = reader.result;

              mammoth
                .convertToHtml({ arrayBuffer: arrayBuffer })
                .then(function(resultObject) {
                  content = resultObject.value;
                  that.editor.commands.insertContentAt(pos, content);
                });
            };
            reader.readAsArrayBuffer(item);
          });
        } else {
          notify("File type not supported");
        }
      },
      setAttachment: attrs => ({ view, tr }) => {
        let pos = 1;
        if (tr && tr.curSelection && tr.curSelection.$head) {
          pos = tr.curSelection.$head.pos;
        }
        const coordinates = { pos, inside: 0 };
        const input = attrs ? attrs : [];
        const files = Array.from(input);
        const nonPreviewFiles = files.filter(file => !/image/i.test(file.type));

        if (nonPreviewFiles.length > 0) {
          nonPreviewFiles.forEach(async item => {
            const preview = false;
            const valid = validateFileSize(notify, item);
            if (valid) {
              const uuid = uuidv4();
              const transformedFile = await fileWithUniqueName(item, uuid);
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
        } else {
          notify("File type not supported");
        }
      },
      setImage: attrs => ({ view, tr }) => {
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
            const valid = validateFileSize(notify, item);
            if (valid) {
              const uuid = uuidv4();
              const transformedFile = await fileWithUniqueName(item, uuid);
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
        } else {
          notify("File type not supported");
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
