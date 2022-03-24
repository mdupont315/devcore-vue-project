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
  dataAttr: 'chapterText',
  color: "#242526",
  fontSize: 18,
}

const titleText = {
  dataAttr: 'titleText',
  color: "#242526",
  fontSize: 14,
}

//futuramedium
const subTitleText = {
  dataAttr: 'subTitleText',
  color: "#4294d0",
  fontSize: 14,
}

//futuralight / narrow
const paragraphText = {
  dataAttr: 'paragraphText',
  color: "#707070",
  fontSize: 14,
}

const getUuid = () => {
  let s = []
  let hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '' // -

  return s.join('').substr(0, 6)
}



export const CustomStyle = Extension.create({
  content: 'inline*',
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
                return {};
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
                return {};
              }
              return {
                style:`font-size: ${attributes.fontSize}px`
              };
            }
          },
          dataAttr: {
            default: null,
            renderHTML: attributes => {
              const dataText = `${attributes.dataAttr}-${getUuid()}`
              console.log(dataText)
              if (!attributes.dataAttr) {
                return {};
              }
              return {
                'data-text':dataText
              };
            }
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      setChapterText: styles => ({ chain }) => {
        console.log(styles)
        return chain()
          .setMark("textStyle", chapterText)
          .run();
      },
      setTitleText: styles => ({ chain }) => {
        console.log(styles)
        return chain()
          .setMark("textStyle", titleText)
          .run();
      },
      setSubTitleText: styles => ({ chain }) => {
        console.log(styles)
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
