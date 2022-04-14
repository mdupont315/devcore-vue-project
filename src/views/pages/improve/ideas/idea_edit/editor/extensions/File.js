import {
  Node,
  nodeInputRule,
  mergeAttributes,
  getMarkRange,
  inputRegex
} from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";
import FileNodeView from "./FileNodeView.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
/**
 * Tiptap Extension to upload images
 * @see  https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 * @since 7th July 2021
 *
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */

const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const File = uploadFn => {
  return Node.create({
    name: "image",
    defaultOptions: {
      inline: false,
      HTMLAttributes: {}
    },

    inline() {
      return this.options.inline;
    },

    group() {
      return this.options.inline ? "inline" : "block";
    },

    draggable: true,

    // addAttributes() {
    //   return {
    //     src: {
    //       default: null
    //     },
    //     alt: {
    //       default: null
    //     },
    //     title: {
    //       default: null
    //     },
    //     href: {
    //       default: null
    //     },
    //     preview: {
    //       default: false
    //     },
    //     id: {
    //       default: null
    //     }
    //   };
    // },
    // parseHTML: () => [
    //   // {
    //   //   tag: "img[src]",
    //   //   getAttrs: dom => {
    //   //     if (typeof dom === "string") return {};
    //   //     const obj = {
    //   //       src: dom.getAttribute("src"),
    //   //       title: dom.getAttribute("title"),
    //   //       alt: dom.getAttribute("alt"),
    //   //       style: dom.getAttribute("style"),
    //   //       type: dom.getAttribute("type"),
    //   //       preview: dom.getAttribute("preview")
    //   //     };
    //   //     return obj;
    //   //   }
    //   // },
    //   // {
    //   //   tag: "a",
    //   //   getAttrs: dom => {
    //   //     if (typeof dom === "string") return {};
    //   //     const obj = {
    //   //       src: dom.getAttribute("src"),
    //   //       href: dom.getAttribute("href"),
    //   //       title: dom.getAttribute("title"),
    //   //       style: dom.getAttribute("style"),
    //   //       type: dom.getAttribute("type"),
    //   //       preview: dom.getAttribute("preview")
    //   //     };
    //   //     return obj;
    //   //   }
    //   // }
    // ],
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
    renderHTML({ HTMLAttributes }) {
      console.log("HTMLATTRS: ", HTMLAttributes);
      return [
        "span",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0
      ];
    },
    addNodeView() {
      return VueNodeViewRenderer(FileNodeView);
    },

    addCommands() {
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

          if (previewFiles.length > 0) {
            previewFiles.forEach(async item => {
              const preview = true;
              uploadFn(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          } else {
            files.forEach(async item => {
              const preview = false;
              uploadFn(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          }
        },
        // removeFile: attrs => ({ view, tr }) => {
        //   //  const { tr } = view.state;
        //   console.log(attrs);
        //   console.log(view, tr);
        //   console.log("remove");
        //   const from = tr.curSelection.$anchor.pos;
        //   const to = tr.to;

        //   const transaction = tr.delete(213, 214);
        //   view.dispatch(transaction);
        // }
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
      return [uploadFilePlugin(uploadFn)];
    }
  });
};
