import { Node, nodeInputRule } from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";
import { fileWithUniqueName, validateFileSize } from "./helpers/file/fileUtils";
import {
  SUPPORTED_PREVIEW_RESIZE_IMAGE_TYPES,
  FILE_SIZE_LIMIT
} from "./helpers/file/constants";
import { PluginKey, Plugin } from "prosemirror-state";

import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import { v4 as uuidv4 } from "uuid";
// import { generateJSON } from '@tiptap/html'
const mammoth = require("mammoth");
const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const formatFileSize = (bytes, decimalPoint) => {
  if (bytes == 0) return "0 Bytes";
  const k = 1000;
  const dm = decimalPoint || 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

function transformElementTable(element) {
  console.log(element);
  if (element.children && element.children[0]) {
    const table = element.children.find(x => x.type === "table");
    if (table && table.children && table.children[0] && table.children[0].type && table.children[0].type === "tableRow") {
      table.children[0].styleId = 'header';
    }
    console.log(element)
    return { ...element };
  } else {
    return element;
  }
}

const convertDocxFileToHtml = async (file, notify) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = function(event) {
      const arrayBuffer = reader.result;

      const options = {
        convertImage: docxFileParser(notify),
        styleMap: ["em => p:fresh"],
        transformDocument: transformElementTable
      };

      mammoth
        .convertToHtml({ arrayBuffer: arrayBuffer }, options)
        .then(function(resultObject) {
          if (!resultObject) {
            //  console.log("HELLO")
            reject(resultObject);
          }
          console.log(resultObject.value);
          resolve(resultObject.value);
        });
    };
    reader.readAsArrayBuffer(file);
  });
};

const docxFileParser = notify =>
  mammoth.images.imgElement(function(image) {
    if (!SUPPORTED_PREVIEW_RESIZE_IMAGE_TYPES.includes(image.contentType)) {
      return notify("Unknown file type in docx file", {
        type: image.contentType
      });
    }
    return image.read("base64").then(function(imageBuffer) {
      const mod = imageBuffer.slice(-2) === "==" ? 2 : 1;
      const base64size = imageBuffer.length * (3 / 4) - mod;
      if (base64size <= FILE_SIZE_LIMIT) {
        return {
          src: "data:" + image.contentType + ";base64," + imageBuffer
        };
      } else {
        const data = {
          type: image.contentType,
          size: formatFileSize(base64size, 2),
          limit: formatFileSize(FILE_SIZE_LIMIT)
        };

        notify("File size too big in docx file", data);
      }
    });
  });

export const File = Node.create({
  name: "file",
  // isolating: true,
  // defining: true,
  // allowGapCursor: true,
  priority: 1001,
  selectable: true,

  addOptions() {
    return {
      inline: true,
      HTMLAttributes: {},
      addFile: () => {},
      removeFile: () => {},
      notify: () => {},
      setIsLoading: () => {}
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
        renderHTML: attrs => ({ id: attrs.id })
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
      "data-type": {
        default: null,
        parseHTML: el => {
          return el.getAttribute("data-type");
        },
        renderHTML: attrs => ({ type: attrs["data-type"] })
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
      getAttrs: dom => dom && null
    }
  ],
  renderHTML: ({ HTMLAttributes }) => {
    const { href, title, src, preview, uuid } = HTMLAttributes;

    // return [
    //   "file-component",
    //   { title, src, href, style, size, uuid, name, preview }

    // ];

    return [
      "file-component",
      {
        title,
        src,
        uuid,
        href,
        preview,
        "data-type": HTMLAttributes["data-type"]
      }
    ];
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
    const { addFile, notify, setIsLoading } = this.options;
    return {
      setInlineFile: attrs => async ({ view, tr }) => {
        let pos = 1;
        if (tr && tr.curSelection && tr.curSelection.$head) {
          pos = tr.curSelection.$head.pos;
        }
        const input = attrs ? attrs : [];
        const files = Array.from(input);
        const nonPreviewFiles = files.filter(file => !/image/i.test(file.type));
        let that = this;

        if (nonPreviewFiles[0]) {
          setIsLoading(true);
          notify(
            "Importing document",
            { title: nonPreviewFiles[0].name },
            "info"
          );
          try {
            const res = await convertDocxFileToHtml(
              nonPreviewFiles[0],
              notify,
              pos,
              that
            );
            setIsLoading(false);

            if (res) {
              setTimeout(() => {
                try {
                  this.editor.commands.insertContentAt(pos, res);
                } catch (e) {
                  let reason = e && e.message ? `${e.message}` : "";

                  notify("Failed to parse docx to editor", { message: reason });
                }
              });
            }
          } catch (e) {
            console.log(e);
          } finally {
            window.vm.$snotify.clear();
          }
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
              addFile({ uuid, file: item });
              renderFileInBase64ToCoordinates(
                item,
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
              // const transformedFile = await fileWithUniqueName(item, uuid);
              addFile({ uuid, file: item });
              renderFileInBase64ToCoordinates(
                item,
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

  // const test =

  addProseMirrorPlugins() {
    const { addFile } = this.options;
    const { notify } = this.options;
    return [
      uploadFilePlugin(addFile, notify)
      // new Plugin({
      //   key: "fileNodeContentEditable",
      //   props: {
      //     decorations: ({ doc, selection }) => {
      //       const { anchor, from, to } = selection;
      //       const decorations = [];
      //       const attrsToAdd = { contenteditable: "false" };

      //       console.log(selection);

      //       doc.descendants((node, pos, parent) => {
      //         if (node.type.name === "file") {
      //           console.log({ parent });
      //         }
      //       });

      //       return false;
      //     }
      //   }
      // })
    ];
  }
});
