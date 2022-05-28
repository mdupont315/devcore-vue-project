import Link from "@tiptap/extension-link";
import { mergeAttributes } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

export const CustomLink = Link.extend({
  addOptions() {
    return {
      HTMLAttributes: {
        target: "_blank",
        href: null
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
    const { uuid, href, target } = HTMLAttributes;
    return [
      "span",
      { class: "is-link" },
      [
        "a",
        mergeAttributes(this.options.HTMLAttributes, {
          "data-uuid": uuid,
          href,
          target
        }),
        0
      ],
      ["button", "Remove"]
    ];
  },
  addProseMirrorPlugins() {
    const { options } = this;
    const { removeLink } = options;

    const plugins = [
      new Plugin({
        props: {
          handleDOMEvents: {
            mouseover(view, event) {
              if (!event.target) return false;
              if (
                event.target.localName === "a" ||
                event.target.getAttribute("uuid")
              ) {
                const uuid = event.target.getAttribute("data-uuid");
                const href = event.target.getAttribute("href");
                let links = [...document.querySelectorAll(".is-link")];
                const [thisLink] = links.filter(
                  link =>
                    !!link.children[0] && link.children[0].dataset.uuid === uuid
                );
                if (!thisLink) return false;
                if (!thisLink.firstChild) return false;
                thisLink.firstChild.setAttribute("data-tooltip", href);
              }

              if (
                event.target.localName === "button" ||
                event.target.getAttribute("uuid")
              ) {
                let links = [...document.querySelectorAll(".is-link")];
                if (!event.target.previousSibling) return false;
                const uuid = event.target.previousSibling.getAttribute(
                  "data-uuid"
                );
                const [thisLink] = links.filter(
                  link =>
                    !!link.children[0] && link.children[0].dataset.uuid === uuid
                );
                if (!thisLink) return false;
                if (!thisLink.lastChild) return false;
                thisLink.lastChild.setAttribute(
                  "data-tooltip",
                  "Remove Hyperlink"
                );
                // thisLink.setAttribute("data-tooltip", uuid);
              }

              return false;
            }
          },
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
