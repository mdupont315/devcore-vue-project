import { Extension } from "@tiptap/core";

/**
 * FontSize - Custom Extension
 * editor.commands.setFontSize(e.target.value) :set the font-size.
 */

export const CustomStyle = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"]
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: attributes => {
              console.log("attributes")
              console.log(attributes)
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px;color:${attributes.color}`
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setTitleText: styles => ({ chain }) => {
        console.log(styles)
        return chain()
          .setMark("textStyle", { ...styles })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark("textStyle", { fontSize: null, color: null })
          .removeEmptyTextStyle()
          .run();
      }
    };
  }
});
