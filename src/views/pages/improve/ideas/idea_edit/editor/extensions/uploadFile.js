import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";
import { fileWithUniqueName, validateFileSize } from "./helpers/file/fileUtils";


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
  reader.onload = readerEvent => {
    const node = schema.nodes.file.create({
      src: readerEvent.target?.result,
      title: item.name,
      size: item.size,
      type: item.type,
      pos: coordinates.pos,
      uuid,
      preview
    });

    const transaction = view.state.tr.insert(coordinates.pos, node);
    view.dispatch(transaction);
  };
  reader.readAsDataURL(item);
};

const uploadFilePlugin = (addFile, notify) => {
  return new Plugin({
    props: {
      handlePaste: async (view, event, slice) => {
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
            const transformedFile = await fileWithUniqueName(view, itemAsFile);
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
          } else {
            const preview = false;
            const itemAsFile = item.getAsFile();
            const transformedFile = await fileWithUniqueName(view, itemAsFile);
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
              const valid = validateFileSize(notify, item);
              if (valid) {
                const uuid = uuidv4();
                const transformedFile = await fileWithUniqueName(view, item);
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
                const transformedFile = await fileWithUniqueName(view, item);
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

export { renderFileInBase64ToCoordinates, uploadFilePlugin, validateFileSize };
