import { Node, nodeInputRule, mergeAttributes, inputRegex } from "@tiptap/core";

import { uploadImagePlugin } from "./uploadImage";

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

export const Image = uploadFn => {
  console.log(uploadFn);
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
        }
      };
    },
    parseHTML: () => [
      {
        tag: "img[src]",
        getAttrs: dom => {
          if (typeof dom === "string") return {};

          const obj = {
            src: dom.getAttribute("src"),
            title: dom.getAttribute("title"),
            alt: dom.getAttribute("alt")
          };
          return obj;
        }
      }
    ],
    renderHTML: ({ HTMLAttributes, node }) => {
      console.log(node);
      console.log(HTMLAttributes);
      return ["img", mergeAttributes(HTMLAttributes)];
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
        },
        setImageUrls: attrs => ({
          tr,
          state,
          dispatch,
          view,
          node,
          commands
        }) => {
          const { doc } = state;

          const fileName = "mobileview.PNG";
          doc.descendants((node, pos) => {
            if (node.type.name === "image") {
              console.log(node);
              // node.attrs.src =
              //   "http://homestead.test/images/users/17/0x0/Xoc9YBHW1omOharJUn0sltukzi16ncAd9P41DjD8.jpg";
              // // console.log("node");
              // // console.log(node);

              const from = pos;
              const to = pos + node.nodeSize;
              const transaction = view.state.tr.deleteRange(from, to);

              view.dispatch(transaction);
              return true;
            }
            return false;
          });
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
      return [uploadImagePlugin(uploadFn)];
    }
  });
};
