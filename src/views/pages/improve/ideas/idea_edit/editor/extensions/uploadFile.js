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
    if (preview) {
      const image = new Image();
      image.src = readerEvent.target?.result;

      image.onload = () => {
        const transaction = view.state.tr.insert(
          coordinates.pos,
          schema.nodes.file.create({
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
          })
        );
        view.dispatch(transaction);
      };
    } else {
      const transaction = view.state.tr.insert(
        coordinates.pos,
        schema.nodes.file.create({
          src: readerEvent.target?.result,
          title: item.name,
          size: item.size,
          type: item.type,
          pos: coordinates.pos,
          uuid,
          preview,
          dimensions: {
            width: null,
            height: null
          }
        })
      );
      view.dispatch(transaction);
    }
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

        items.forEach(function(item) {
          if (item.kind != "file") return;
          if (item.type.indexOf("image") === 0) {
            event.preventDefault();
            const preview = true;

            const itemAsFile = item.getAsFile();
            const uuid = uuidv4();
            const transformedFile = fileWithUniqueName(itemAsFile, uuid);
            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
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
            const uuid = uuidv4();
            const transformedFile = fileWithUniqueName(itemAsFile, uuid);
            const valid = validateFileSize(notify, itemAsFile);
            console.log("ITEM:::::::::::::");
            console.log(itemAsFile);
            if (valid) {
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
        });
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
                const transformedFile = fileWithUniqueName(item, uuid);

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
                const transformedFile = fileWithUniqueName(item, uuid);

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
