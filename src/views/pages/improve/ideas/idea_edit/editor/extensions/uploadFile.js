import { Plugin } from "prosemirror-state";

/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 */

const renderFileInBase64ToCoordinates = (item, view, coordinates, preview) => {
  const { schema } = view.state;
  if (item.size > 1000000) {
    console.log("ERROR, File size too big!");
    return;
  }
  const reader = new FileReader();
  reader.onload = readerEvent => {
    const node = schema.nodes.image.create({
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
      // handlePaste(view, event) {
      //   console.log("PASTING CONTETN!");
      //   const items = Array.from(event.clipboardData?.items || []);
      //   const { schema } = view.state;

      //   const previewFiles = items.filter(file => /image/i.test(file.type));
      //   console.log(items)
      //   console.log("1")
      //   console.log(previewFiles)
      //   previewFiles.forEach(item => {
      //     console.log("2")
      //     const image = item.getAsFile();
      //     console.log(image);
      //     console.log("typeof", item.type.indexOf("image"));

      //     event.preventDefault();
      //     const reader = new FileReader();
      //     reader.onload = readerEvent => {
      //       const node = schema.nodes.image.create({
      //         src: readerEvent.target?.result
      //       });
      //       const transaction = view.state.tr.replaceSelectionWith(node);
      //       view.dispatch(transaction);
      //     };
      //     console.log("3")
      //     reader.readAsDataURL(image);
      //   });

      //   return false;
      // },

      handleDOMEvents: {
        drop(view, event) {
          const hasFiles = event.dataTransfer?.files?.length;

          if (!hasFiles) {
            return false;
          }

          const data = Array.from(event.dataTransfer?.files ?? []);
          const previewFiles = data.filter(file => /image/i.test(file.type));

          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });

          console.log(coordinates)

          if (previewFiles.length > 0) {
            previewFiles.forEach(async item => {
              const preview = true;
              addFile(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          } else {
            data.forEach(async item => {
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
