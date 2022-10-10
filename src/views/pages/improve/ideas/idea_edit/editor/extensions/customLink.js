// import Link from "@tiptap/extension-link";
// import { mergeAttributes } from "@tiptap/core";
// import { Plugin } from "prosemirror-state";
//
// import { find, registerCustomProtocol } from "linkifyjs";

import { Mark, markPasteRule, mergeAttributes } from "@tiptap/core";
import { find, registerCustomProtocol } from "linkifyjs";
import { autolink } from "./helpers/link/autolink";
import { clickHandler } from "./helpers/link/clickHandler";
import { pasteHandler } from "./helpers/link/pasteHandler";

const URL_INCLUDE_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
const URL_EXCLUDE_REGEX = /.*@.*/;

const validateUrlNotEmail = link => {
  let result = false;

  link.replace(URL_INCLUDE_REGEX, matchedText => {
    if (!URL_EXCLUDE_REGEX.test(matchedText)) {
      result = true;
    }
  });
  console.log(result)

  return result;
};

export const CustomLink = Mark.create({
  name: "link",

  priority: 1000,

  keepOnSplit: false,

  content: "text*",

  onCreate() {
    this.options.protocols.forEach(registerCustomProtocol);
  },

  inclusive() {
    return this.options.autolink;
  },
  addOptions() {
    return {
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      protocols: ["www"],
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
  renderHTML({ HTMLAttributes }) {
    const { uuid, href, target } = HTMLAttributes;

    if (!href) return true;

  //   const validate = validateUrlNotEmail(href);

  //  if (!validate) return true;

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
