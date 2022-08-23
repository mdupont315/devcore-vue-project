import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";
import { fileWithUniqueName, validateFileSize } from "./helpers/file/fileUtils";
import ImageResizer from "@/lib/image-resizer";

const resizerInstance = new ImageResizer();

const renderFileInBase64ToCoordinates = (
  item,
  view,
  coordinates,
  preview,
  uuid
) => {
  if (!item) return;

  const { schema } = view.state;

  const reader = new FileReader();

  console.log(item);

  reader.onload = readerEvent => {
    let image = new Image();
    image.src = readerEvent.target?.result;

    console.log(readerEvent);

    image.onload = () => {
      const node = schema.nodes.file.create({
        src: image.src,
        title: item.name,
        size: item.size,
        type: item.type,
        pos: coordinates.pos,
        uuid,
        preview,
        dimensions: {
          width: image.width,
          height: image.height
        }
      });
      const transaction = view.state.tr.insert(coordinates.pos, node);
      view.dispatch(transaction);
    };
  };
  reader.readAsDataURL(item);
};

const uploadFilePlugin = (addFile, notify) => {
  return new Plugin({
    props: {
      handlePaste: (view, event, slice) => {
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
            console.log(itemAsFile);
            const transformedFile = fileWithUniqueName(view, itemAsFile);
            //const transformedFile = itemAsFile;
            console.log("adding file")
            addFile({ uuid: uuidv4(), file: transformedFile });
            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              console.log(itemAsFile);

              const uuid = uuidv4();
              renderFileInBase64ToCoordinates(
                transformedFile,
                view,
                coordinates,
                preview,
                uuid
              );
            }
          } else {
            const preview = false;
            const itemAsFile = item.getAsFile();
            const transformedFile = fileWithUniqueName(view, itemAsFile);
            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              const uuid = uuidv4();
              addFile({ uuid, file: transformedFile });
              renderFileInBase64ToCoordinates(
                transformedFile,
                view,
                coordinates,
                preview,
                uuid
              );
            }
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

          const previewFiles = data.filter(file => /image/i.test(file.type));
          const nonPreviewFiles = data.filter(
            file => !/image/i.test(file.type)
          );

          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });

          if (previewFiles.length > 0) {
            previewFiles.forEach(async item => {
              const preview = true;
              console.log(item.type);
              const valid = validateFileSize(notify, item);
              if (valid) {
                const uuid = uuidv4();
                const transformedFile = fileWithUniqueName(view, item);
                addFile({ uuid, file: transformedFile });
                renderFileInBase64ToCoordinates(
                  transformedFile,
                  view,
                  coordinates,
                  preview,
                  uuid
                );
              }
            });
          }

          if (nonPreviewFiles.length > 0) {
            nonPreviewFiles.forEach(async item => {
              const preview = false;
              const valid = validateFileSize(notify, item);
              if (valid) {
                const uuid = uuidv4();
                const transformedFile = fileWithUniqueName(view, item);
                addFile({ uuid, file: transformedFile });
                renderFileInBase64ToCoordinates(
                  transformedFile,
                  view,
                  coordinates,
                  preview,
                  uuid
                );
              }
            });
          }

          return false;
        }
      }
    }
  });
};

export { renderFileInBase64ToCoordinates, uploadFilePlugin };
