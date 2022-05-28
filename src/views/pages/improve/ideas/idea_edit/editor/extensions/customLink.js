import Link from "@tiptap/extension-link";
import { mergeAttributes } from "@tiptap/core";
import { Plugin, TextSelection } from "prosemirror-state";
import { getMarkRange } from "tiptap-utils";

export const CustomLink = Link.extend({
  addOptions() {
    return {
      HTMLAttributes: {
        target: "_blank",
      },
      linkOnPaste: true,
      openOnClick: true,
      removeLink: () => {}
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
            uuid: dom.getAttribute("uuid")
          };
        }
      }
    ];
  },
  renderHTML({ mark, HTMLAttributes }) {
    console.log(HTMLAttributes);
    const { uuid, href, target } = HTMLAttributes;
    return [
      "span",
      { class: "is-link" },
      [
        "a",
        mergeAttributes(this.options.HTMLAttributes, { uuid, href, target }),
        0
      ],
      ["button", { "data-uuid": uuid }]
    ]
  },
  addProseMirrorPlugins() {
    const { options } = this;
    const { removeLink } = options;

    const plugins = [
      new Plugin({
        props: {
          handleClick(view, pos, event) {
            if (!event.target.dataset.uuid) return;
            const { uuid } = event.target.dataset;
            removeLink(pos, uuid);
            return true;
            // //view.dispatch(tr.setSelection(new TextSelection($start, $end)));
            // The link mark's renderHTML renders an <a> element with a data-link attribute set
            // I register a new Plugin where I listen for the mouseover event
            // In the event handler, I check that event.target is an <a> element with my data-link attribute, and then display a tooltip for it (using Tippy.js)
            // For the edit button in the tooltip (see below), I can retrieve the ProseMirror node for the element using pos = view.posAtDOM(event.target) and then node = view.state.doc.nodeAt(pos)
            // return true;
          }
        }
      })
    ];

    return plugins;
  }
});
