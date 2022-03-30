import { Node, nodeInputRule, mergeAttributes, inputRegex } from "@tiptap/core";

import { uploadFilePlugin } from "./uploadFile";

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
    atom: true,

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
        }
      };
    },
    parseHTML: () => [
      {
        tag: "img[src]",
        getAttrs: dom => {
          if (typeof dom === "string") return {};

          console.log("parseHTML test");

          const obj = {
            src: dom.getAttribute("src"),
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt")
          };
          return obj;
        }
      },
      {
        tag: "a",
        getAttrs: dom => {
          if (typeof dom === "string") return {};

          console.log("parseHTML wrapper");

          const obj = {
            src: dom.getAttribute("src"),
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt"),
            "data-test": "test"
          };
          return obj;
        },
        addAttributes() {
          return {
            href: "test"
          };
        }
      }
    ],
    renderHTML: ({ HTMLAttributes, node }) => {
      console.log("render");
      console.log(HTMLAttributes);
      console.log(node);

      const { href, title, src, alt } = HTMLAttributes;
      if (HTMLAttributes.href) {
        console.log(mergeAttributes(HTMLAttributes));
        return ["a", { href }, ["img", { title, src, alt }, 0]];
      }
      return ["img", { title, src, alt }];
    },

    addCommands() {
      return {
        setImage: attrs => ({ state, dispatch }) => {
          const { selection } = state;
          const position = selection.$head
            ? selection.$head.pos
            : selection.$to.pos;

          const node = this.type.create(attrs);
          const transaction = state.tr.insert(position, node);

          console.log(" SET IMAGE ");
          return dispatch?.(transaction);
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
      return [uploadFilePlugin(uploadFn)];
    }
  });
};
