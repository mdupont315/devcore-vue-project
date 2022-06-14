import { Plugin } from "prosemirror-state";
import { v4 as uuidv4 } from "uuid";

const FILE_SIZE_LIMIT = 6000000;
/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392

*/

const validateFileSize = (notify, file) => {
  console.log(file);

  let valid = true;
  if (file.size > FILE_SIZE_LIMIT) {
    notify(file, FILE_SIZE_LIMIT);
    console.log("ERROR, File size too big!");
    valid = false;
  }
  return valid;
};

const renderFileInBase64ToCoordinates = (
  item,
  view,
  coordinates,
  preview,
  uuid
) => {
  if (!item) return;

  let fileTitle = item.name;
  const { schema } = view.state;

  //let docFileNames = [];
  if (view && view.state && view.state.doc) {
    const { doc } = view.state;
    const { content } = doc.content;
    const sameNameFiles = content.filter(
      node =>
        node.type && node.type.name === "file" && node.attrs.title === item.name
    );

    if (sameNameFiles.length > 0) {
      const splitFileName = item.name.split(".").pop()
      fileTitle = item.name.replace(`.${splitFileName}`, `(${sameNameFiles.length + 1})`) + `.${splitFileName}`
    }

    console.log(sameNameFiles);
    //  docFiles.forEach(node => docFileNames.push(node.attrs.title));
  }

  const reader = new FileReader();
  reader.onload = readerEvent => {
    const node = schema.nodes.file.create({
      src: readerEvent.target?.result,
      title: fileTitle,
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
            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              const uuid = uuidv4();
              addFile({ uuid, file: itemAsFile });
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

            const valid = validateFileSize(notify, itemAsFile);
            if (valid) {
              const uuid = uuidv4();
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

          if (nonPreviewFiles.length > 0) {
            nonPreviewFiles.forEach(async item => {
              const preview = false;
              const valid = validateFileSize(notify, item);
              if (valid) {
                const uuid = uuidv4();
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

export { renderFileInBase64ToCoordinates, uploadFilePlugin, validateFileSize };
