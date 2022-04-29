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
    const node = schema.nodes.file.create({
      src: readerEvent.target?.result,
      title: item.name,
      type: item.type,
      preview
    });
    console.log(node);

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

        console.log("ADD FILE ", addFile)

        console.log(this);
        for (const item of items) {
          console.log("item", item);
          console.log(item.kind);
          if (item.kind != "file") return;
          if (item.type.indexOf("image") === 0) {
            console.log("ITEM IS IMAGE ! ");
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

          console.log(event.dataTransfer);

          console.log("ADD FILE ", addFile)
          const data = Array.from(event.dataTransfer?.files ?? []);
          const previewFiles = data.filter(file => /image/i.test(file.type));
          const nonPreviewFiles = data.filter(
            file => !/image/i.test(file.type)
          );

          console.log("data", data);
          console.log("nonPreviewFiles", nonPreviewFiles);

          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });

          if (previewFiles.length > 0) {
            console.log(previewFiles);
            previewFiles.forEach(async item => {
              const preview = true;
              addFile(item);
              renderFileInBase64ToCoordinates(item, view, coordinates, preview);
            });
          }

          if (nonPreviewFiles.length > 0) {
            console.log(data);
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
