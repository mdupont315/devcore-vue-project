import { Plugin } from "prosemirror-state";

/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 */


const renderFileInBase64ToCoordinates = (item, view, coordinates, preview) => {
  const { schema } = view.state;
  console.log("item", item);

  if (!item) return;
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
          console.log("item", item)
          console.log(item.kind)
          if (item.kind != "file") return;
          if (item.type.indexOf("image") === 0) {
            event.preventDefault();
            const preview = true;
            const image = item.getAsFile();
            console.log(image)

            addFile(item);
            renderFileInBase64ToCoordinates(image, view, coordinates, preview);
          } else {
            const preview = false;
            const file = item.getAsFile();
            addFile(item);
            renderFileInBase64ToCoordinates(file, view, coordinates, preview);
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

          console.log(event.dataTransfer);

          const data = Array.from(event.dataTransfer?.files ?? []);
          const previewFiles = data.filter(file => /image/i.test(file.type));

          console.log("data", data);

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
