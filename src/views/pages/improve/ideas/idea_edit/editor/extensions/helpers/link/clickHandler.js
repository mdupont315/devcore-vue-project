import { getAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";

export function clickHandler(options) {
  return new Plugin({
    key: new PluginKey("handleClickLink"),
    props: {
      handleClick: (view, pos, event) => {
        const attrs = getAttributes(view.state, options.type.name);
        const link = event.target?.closest("a");
        if (link && attrs.href) {
          window.open(attrs.href, attrs.target);
          return true;
        }


        if (event.target.localName === "button") {
          const uuid = event.target.getAttribute("data-uuid");
          if (uuid) {
            options.remove(pos, uuid);
            return true;
          }
        }

        return false;
      }
    }
  });
}
