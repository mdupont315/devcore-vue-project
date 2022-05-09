import { Plugin } from "prosemirror-state";
const mammoth = require("mammoth");
/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 */

// function parseWordDocxFile(inputElement) {
//   var files = inputElement.files || [];
//   if (!files.length) return;
//   var file = files[0];

//   console.time();
//   var reader = new FileReader();
//   reader.onloadend = function(event) {
//     var arrayBuffer = reader.result;
//     let file = null;
//     // debugger

//     mammoth
//       .convertToHtml({ arrayBuffer: arrayBuffer })
//       .then(function(resultObject) {
//         file = resultObject.value;
//         console.log(resultObject.value);
//       });
//     console.log(file);
//   };
//   reader.readAsArrayBuffer(file);
// }

const renderFileInBase64ToCoordinates = (item, view, coordinates, preview) => {
  const { schema } = view.state;

  if (!item) return;
  if (item.size > 10000000) {
    console.log("ERROR, File size too big!");
    return;
  }
  const reader = new FileReader();
  reader.onload = readerEvent => {
    const node = schema.nodes.file.create({
      src: readerEvent.target?.result,
      title: item.name,
      type: item.type,
      preview
    });

    const transaction = view.state.tr.insert(coordinates.pos, node);
    view.dispatch(transaction);
  };
  reader.readAsDataURL(item);
};

const uploadFilePlugin = addFile => {
  return new Plugin({
    props: {
      handlePaste(view, event, slice) {
        const items = (event.clipboardData || event.originalEvent.clipboardData)
          .items;

        if (items.length === 0) return;

        let pos = 1;
        if (
          view.state.tr &&
          view.state.tr.curSelection &&
          view.state.tr.curSelection.$head
        ) {
          pos = view.state.tr.curSelection.$head.pos;
        }
        const coordinates = { pos, inside: 0 };

        for (const item of items) {
          if (item.kind != "file") return;
          if (item.type.indexOf("image") === 0) {
            event.preventDefault();
            const preview = true;

            const itemAsFile = item.getAsFile();

            addFile(itemAsFile);
            renderFileInBase64ToCoordinates(
              itemAsFile,
              view,
              coordinates,
              preview
            );
          } else {
            const preview = false;
            const itemAsFile = item.getAsFile();
            addFile(itemAsFile);
            renderFileInBase64ToCoordinates(
              itemAsFile,
              view,
              coordinates,
              preview
            );
          }
        }
        return false;
      },

      handleDOMEvents: {
        drop(view, event) {
          const hasFiles = event.dataTransfer?.files?.length;

          if (!hasFiles) {
            return false;
          }

          const data = Array.from(event.dataTransfer?.files ?? []);
          console.log(data);



          const previewFiles = data.filter(file => /image/i.test(file.type));
          const nonPreviewFiles = data.filter(
            file => !/image/i.test(file.type)
          );

        //  const docxFiles = data.filter(file => /vnd.openxmlformats-officedocument.wordprocessingml.document/i.test(file.type));

        //  console.log(data)
        //  console.log(docxFiles);
        //  parseWordDocxFile(docxFiles)

          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });

          if (previewFiles.length > 0) {
            previewFiles.forEach(async item => {
              const preview = true;
              addFile(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          }

          if (nonPreviewFiles.length > 0) {
            nonPreviewFiles.forEach(async item => {
              const preview = false;
              addFile(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          }

          return false;
        }
      }
    }
  });
};

export { renderFileInBase64ToCoordinates, uploadFilePlugin };
