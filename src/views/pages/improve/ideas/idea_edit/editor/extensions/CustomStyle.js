import { Extension } from "@tiptap/core";

/**
 * FontSize - Custom Extension
 * editor.commands.setFontSize(e.target.value) :set the font-size.
 */

/*
CHAPTER =>
16PX
FUTURA
BOLD
#242526
*/

//futurabold
const chapterText = {
  color: "#242526",
  fontSize: 18,
  type: "chapter",
  class: "chapterText"
};

const titleText = {
  color: "#242526",
  fontSize: 14,
  type: "title",
  class: "titleText"
};

//futuramedium
const subTitleText = {
  color: "#4294d0",
  fontSize: 14,
  type: "subtitle",
  class: "subtitleText"
};

//futuralight / narrow
const paragraphText = {
  color: "#707070",
  fontSize: 14,
  type: "paragraph",
  class: "paragraphText"
};

const getUuid = () => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = ""; // -

  return s.join("").substr(0, 6);
};

export const CustomStyle = Extension.create({
  content: "inline*",
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
          color: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.color) {
                return {
                  style: `color:${paragraphText.color}`
                };
              }
              return {
                style: `color:${attributes.color}`
              };
            }
          },
          fontSize: {
            default: null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {
                  style: `font-size:${paragraphText.fontSize}px`
                };
              }
              return {
                style: `font-size: ${attributes.fontSize}px`
              };
            }
          },
          type: {
            default: null,
            renderHTML: attributes => {
              let prefix = "p";
              if (attributes.type === "chapter") {
                prefix = "c";
              } else if (attributes.type === "title") {
                prefix = "t";
              } else {
                prefix = "s";
              }
              if (!attributes.dataAttr) {
                const dataText = `${prefix}-${getUuid()}`;
                return {
                  "data-text": dataText
                };
              }
              return {
                "data-text": attributes.dataAttr
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setChapterText: styles => ({ chain, tr, state, dispatch, editor }) => {
        return chain()
          .setMark("textStyle", chapterText)
          .run();
      },
      setTitleText: styles => ({ chain }) => {
        return chain()
          .setMark("textStyle", titleText)
          .run();
      },
      setSubTitleText: styles => ({ chain }) => {
        return chain()
          .setMark("textStyle", subTitleText)
          .run();
      },
      setParagraphText: () => ({ chain }) => {
        return chain()
          .setMark("textStyle", paragraphText)
          .removeEmptyTextStyle()
          .run();
      }
    };
  }
});
