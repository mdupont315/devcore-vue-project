// import Link from "@tiptap/extension-link";
// import { mergeAttributes } from "@tiptap/core";
// import { Plugin } from "prosemirror-state";
//
// import { find, registerCustomProtocol } from "linkifyjs";

import { Mark, markPasteRule, mergeAttributes } from "@tiptap/core";
import { find, registerCustomProtocol } from "linkifyjs";
import { v4 as uuidv4 } from "uuid";
import { autolink } from "./helpers/link/autolink";
import { clickHandler } from "./helpers/link/clickHandler";
import { pasteHandler } from "./helpers/link/pasteHandler";

export const CustomLink = Mark.create({
  name: "link",

  priority: 1000,

  keepOnSplit: false,

  onCreate() {
    this.options.protocols.forEach(registerCustomProtocol);
  },

  inclusive() {
    return this.options.autolink;
  },
  addOptions() {
    return {
      // HTMLAttributes: {
      //   target: "_blank",
      //   href: null,
      //   uuid: null
      // },
      // linkOnPaste: true,
      // openOnClick: true,
      // removeLink: () => {},
      // validate: href => /^https?:\/\//.test(href),

      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      protocols: ['www'],
      HTMLAttributes: {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        class: null,
        uuid: null
      },
      validate: undefined
    };
  },
  addCommands() {
    return {
      setLink: attributes => ({ chain }) => {
        return chain()
          .setMark(this.name, attributes)
          .setMeta("preventAutolink", true)
          .run();
      },

      toggleLink: attributes => ({ chain }) => {
        return chain()
          .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
          .setMeta("preventAutolink", true)
          .run();
      },

      unsetLink: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name, { extendEmptyMarkRange: true })
          .setMeta("preventAutolink", true)
          .run();
      }
    };
  },
  addAttributes() {
    return {
      href: {
        default: this.options.HTMLAttributes.href
      },
      uuid: {
        default: null,
        parseHTML: el => {
          console.log(el);
          return el.getAttribute("uuid");
        },
        renderHTML: attrs => ({ uuid: attrs.uuid })
      },
      target: {
        default: this.options.HTMLAttributes.target
      },
      class: {
        default: this.options.HTMLAttributes.class
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'a[href]:not([href *= "javascript:" i])',
        getAttrs: dom => {
          return {
            "data-uuid": dom.getAttribute("uuid")
          };
        }
      }
    ];
  },
  renderHTML({ mark, HTMLAttributes }) {
    const { uuid, href, target } = HTMLAttributes;
    const validate = /^https?:\/\//.test(href);

    if (!href) return true;

    if (!validate) {
      return ["p", 0];
    }

    if (!uuid) {
      return [
        "a",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        0
      ];
    }

    return [
      "span",
      { class: "is-link" },
      [
        "a",
        mergeAttributes(this.options.HTMLAttributes, {
          href,
          target,
          "data-tooltip": href
        }),
        0
      ],
      [
        "button",
        { "data-tooltip": window.vm.$t("RemoveHyperLink"), "data-uuid": uuid },
        window.vm.$t("Remove")
      ]
    ];
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: text =>
          find(text)
            .filter(link => {
              if (this.options.validate) {
                return this.options.validate(link.value);
              }

              return true;
            })
            .filter(link => link.isLink)
            .map(link => ({
              text: link.value,
              index: link.start,
              data: link
            })),
        type: this.type,
        getAttributes: match => ({
          href: match.data?.href
        })
      })
    ];
  },
  addProseMirrorPlugins() {
    const plugins = [];
    const { options } = this;
    const { removeLink } = options;

    if (this.options.autolink) {
      plugins.push(
        autolink({
          type: this.type,
          validate: this.options.validate
        })
      );
    }

    if (this.options.openOnClick) {
      plugins.push(
        clickHandler({
          type: this.type,
          remove: removeLink
        })
      );
    }

    if (this.options.linkOnPaste) {
      plugins.push(
        pasteHandler({
          editor: this.editor,
          type: this.type
        })
      );
    }

    return plugins;
  }
});
