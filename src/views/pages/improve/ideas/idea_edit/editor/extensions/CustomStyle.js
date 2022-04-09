import { Extension } from "@tiptap/core";
import { TextSelection, AllSelection } from "prosemirror-state";

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

// const updateIndentLevel = (tr, delta) => {
//   const { doc, selection } = tr;

//   if (!doc || !selection) return tr;

//   if (
//     !(selection instanceof TextSelection || selection instanceof AllSelection)
//   ) {
//     return tr;
//   }

//   const { from, to } = selection;

//   doc.nodesBetween(from, to, (node, pos) => {
//     const nodeType = node.type;
//     console.log("name", nodeType.name)

//     if (nodeType.name === "paragraph" || nodeType.name === "heading") {
//       tr = setNodeIndentMarkup(tr, pos, delta);
//       return false;
//     }

//     return true;
//   });

//   return tr;
// };

// function setNodeIndentMarkup(tr, pos, delta) {
//   if (!tr.doc) return tr;

//   const node = tr.doc.nodeAt(pos);
//   if (!node) return tr;

//   const minIndent = IndentProps.min;
//   const maxIndent = IndentProps.max;

//   const indent = clamp((node.attrs.indent || 0) + delta, minIndent, maxIndent);

//   if (indent === node.attrs.indent) return tr;

//   const nodeAttrs = {
//     ...node.attrs,
//     indent
//   };

//   return tr.setNodeMarkup(pos, node.type, nodeAttrs, node.marks);
// }

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
                  style: `color:${paragraphText.fontSize}`
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
                console.log(attributes);
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
          // dataAttr: {
          //   default: null,
          //   renderHTML: attributes => {
          //     const dataText = `${attributes.dataAttr}-${getUuid()}`
          //     if (!attributes.dataAttr) {
          //       return {
          //         'data-text':dataText
          //       };
          //     }
          //     return {
          //       'data-text':attributes.dataAttr
          //     };
          //   }
          // }
        }
      }
    ];
  },
  addCommands() {
    return {
      setChapterText: styles => ({ chain, tr, state, dispatch, editor }) => {
        // const { selection } = state;
        console.log(chain);
        // tr = tr.setSelection(selection);
        // tr = updateIndentLevel(tr, IndentProps.more);
        // console.log("chapter:", chapterText);
        return chain()
          .setMark("textStyle", chapterText)
          .run();
      },
      setTitleText: styles => ({ chain }) => {
        console.log(styles);
        return chain()
          .setMark("textStyle", titleText)
          .run();
      },
      setSubTitleText: styles => ({ chain }) => {
        console.log(styles);
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
