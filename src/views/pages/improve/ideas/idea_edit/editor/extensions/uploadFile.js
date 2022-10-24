import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";
import { validateFileSize } from "./helpers/file/fileUtils";

const renderFileInBase64ToCoordinates = (
  item,
  view,
  coordinates,
  preview,
  uuid
) => {
  if (!item) return;
  const { editor } = view.dom;
  let _item = item;
  if (!editor) return;

  const fileHTML = item => {
    const { url, title, preview, uuid, type } = item;
    return `<file-component src="${url}" title="${title}" uuid="${uuid}" type="${type}" data-type="${
      preview ? "image" : "link"
    }"></file-component>`;
  };

  const reader = new FileReader();

  reader.onload = readerEvent => {
    const fileAttrs = {
      url: readerEvent.target?.result,
      title: _item.name,
      uuid,
      type: _item.type,
      preview
    };
    editor
      .chain()
      .insertContentAt(coordinates.pos, fileHTML(fileAttrs))
      .run();

    editor.chain().enter().run()
  };
  reader.readAsDataURL(_item);
};

const uploadFilePlugin = (addFile, notify) => {
  return new Plugin({
    props: {
      handlePaste: (view, event, slice) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData)
          .items;

        if (items.length === 0) return;

        let pos = 0;
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
            const uuid = uuidv4();

            let itemAsFile = item.getAsFile();

            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              //   addFile({ uuid, file: transformedFile });
              renderFileInBase64ToCoordinates(
                itemAsFile,
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
            //  const transformedFile = fileWithUniqueName(itemAsFile, uuid);
            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              addFile({ uuid, file: itemAsFile });
              renderFileInBase64ToCoordinates(
                itemAsFile,
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
                //  const transformedFile = fileWithUniqueName(item, uuid);

                renderFileInBase64ToCoordinates(
                  item,
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
                // const transformedFile = fileWithUniqueName(item, uuid);

                addFile({ uuid, file: item });
                renderFileInBase64ToCoordinates(
                  item,
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
