import { Extension } from "@tiptap/core";

export const Position = Extension.create({
  name: "position",

  addStorage() {
    return {
      scrollPosition: 0,
      clientWidth: null,
      clientHeight: null
    };
  },
});
