import { Plugin } from "prosemirror-state";

/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 */

export const uploadImagePlugin = addFile => {
  return new Plugin({
    props: {
      handlePaste(view, event) {
        console.log("----onhandlePaste image---");

        const items = Array.from(event.clipboardData?.items || []);
        const { schema } = view.state;

        items.forEach(async item => {
          const image = item.getAsFile();
          await addFile(image)
          if (item.type.indexOf("image") === 0) {
            const reader = new FileReader();
            reader.onload = async (readerEvent) => {
              const node = schema.nodes.image.create({
                  src: readerEvent.target.result,
                  imageData: image,
              })
              const transaction = view.state.tr.replaceSelectionWith(node)
              view.dispatch(transaction)
          }
            // event.preventDefault();
            // //   if (upload && image) {
            // //     upload(image).then(src => {
            // //       const node = schema.nodes.image.create({
            // //         src
            // //       });
            // //       const transaction = view.state.tr.replaceSelectionWith(node);
            // //       view.dispatch(transaction);
            // //     });
            // //   }
            // // } else {
            // const reader = new FileReader();
            // reader.onload = readerEvent => {
            //   const node = schema.nodes.image.create({
            //     src: readerEvent.target?.result
            //   });
            //   const transaction = view.state.tr.replaceSelectionWith(node);
            //   view.dispatch(transaction);
            // };
            // if (!image) return;
            // reader.readAsDataURL(image);
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

          const images = Array.from(
            event.dataTransfer?.files ?? []
          ).filter(file => /image/i.test(file.type));

          if (images.length === 0) {
            return false;
          }

          event.preventDefault();

          const { schema } = view.state;
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });
          images.forEach(async image => {
            const reader = new FileReader();
            // if (!upload) {
            //   const node = schema.nodes.image.create({
            //     src: await upload(image),
            //     title: image.name
            //   });
            //   const transaction = view.state.tr.insert(coordinates.pos, node);
            //   view.dispatch(transaction);
            // } else {
            await addFile(image)
            reader.onload = readerEvent => {
              const node = schema.nodes.image.create({
                src: readerEvent.target?.result,
                title: image.name
              });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(image);
            //  }
          });

          // render base64 ( else ) by default
          // ideaform on save => replace base64 with await upload(image) that retuns
          // backend response for image download url
          return false;
        }
      }
    }
  });
};
