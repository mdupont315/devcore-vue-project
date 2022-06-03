import Link from "@tiptap/extension-link";
import { mergeAttributes } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";

export const CustomLink = Link.extend({
  addOptions() {
    return {
      HTMLAttributes: {
        target: "_blank",
        href: null,
        uuid: null
      },
      linkOnPaste: true,
      openOnClick: true,
      removeLink: () => {}
    };
  },
  addCommands() {
    return {
      setLink: attributes => ({ chain }) => {
        console.log(attributes);
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
        default: uuidv4(),
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
    console.log(uuid);
    return [
      "span",
      { class: "is-link", "data-uuid": uuid ?? uuidv4() },
      [
        "a",
        mergeAttributes(this.options.HTMLAttributes, {
          "data-uuid": uuid,
          href,
          target
        }),
        0
      ],
      ["button", window.vm.$t("Remove")]
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
                    !!link &&
                    link.dataset.uuid === uuid
                );
                if (!thisLink) return false;
                if (!thisLink.firstChild) return false;
                thisLink.firstChild.setAttribute("data-tooltip", href);
              }

              if (
                event.target.localName === "button" ||
                event.target.getAttribute("data-uuid")
              ) {
                let links = [...document.querySelectorAll(".is-link")];
                if (!event.target) return false;
                const uuid = event.target.getAttribute(
                  "data-uuid"
                );

                const [thisLink] = links.filter(
                  link =>
                    !!link &&
                    link.dataset.uuid === uuid
                );

                if (!thisLink) return false;
                if (!thisLink.lastChild) return false;
                thisLink.lastChild.setAttribute(
                  "data-tooltip",
                  window.vm.$t("RemoveHyperLink")
                );
                // thisLink.setAttribute("data-tooltip", uuid);
              }

              return false;
            }
          },
          handleClick(view, pos, event) {
            console.log(event);
            if (event.target.localName === "a") {
              if (
                !event.target.parentElement.dataset.uuid ||
                !event.target.href
              ) {
                return;
              }
              if (event.button === 2) return;
              window.open(event.target.href, "__blank");
            }
            if (event.target.localName === "button") {
              if (!event.target.parentElement) return;
              if (
                event.target.parentElement &&
                event.target.parentElement.dataset.uuid
              ) {
                if (event.button === 2) return;
                const uuid = event.target.parentElement.dataset.uuid;
                removeLink(pos, uuid);
              }
            }

            return false;
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
