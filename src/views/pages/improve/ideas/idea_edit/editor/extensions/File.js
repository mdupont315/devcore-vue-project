import { Node, nodeInputRule, mergeAttributes, inputRegex } from "@tiptap/core";

import {
  uploadFilePlugin,
  renderFileInBase64ToCoordinates
} from "./uploadFile";

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

    addAttributes() {
      return {
        src: {
          default: null
        },
        alt: {
          default: null
        },
        title: {
          default: null
        },
        href: {
          default: null
        },
        preview: {
          default: false
        },
        id: {
          default: null
        }
      };
    },
    parseHTML: () => [
      {
        tag: "img[src]",
        getAttrs: dom => {
          if (typeof dom === "string") return {};
          console.log("dom", dom);
          const obj = {
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
          console.log("dom", dom);
          const obj = {
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

    addCommands() {
      return {
        setImage: attrs => ({ view }) => {
          const coordinates = { pos: 1, inside: 0 };

          const files = Array.from(attrs ?? []);
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
