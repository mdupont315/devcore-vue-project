import { Plugin } from "prosemirror-state";

/**
 * function for image drag n drop(for tiptap)
 * @see https://gist.github.com/slava-vishnyakov/16076dff1a77ddaca93c4bccd4ec4521#gistcomment-3744392
 */

export const uploadFilePlugin = addFile => {
  return new Plugin({
    props: {
      // handlePaste(view, event) {
      //   console.log("----onhandlePaste image---");

      //   const items = Array.from(event.clipboardData?.items || []);
      //   const { schema } = view.state;

      //   items.forEach(async item => {
      //     const image = item.getAsFile();
      //     await addFile(image)
      //     if (item.type.indexOf("image") === 0) {
      //       const reader = new FileReader();
      //       reader.onload = async (readerEvent) => {
      //         const node = schema.nodes.image.create({
      //             src: readerEvent.target.result,
      //             imageData: image,
      //         })
      //         const transaction = view.state.tr.replaceSelectionWith(node)
      //         view.dispatch(transaction)
      //     }
      //       // event.preventDefault();
      //       // //   if (upload && image) {
      //       // //     upload(image).then(src => {
      //       // //       const node = schema.nodes.image.create({
      //       // //         src
      //       // //       });
      //       // //       const transaction = view.state.tr.replaceSelectionWith(node);
      //       // //       view.dispatch(transaction);
      //       // //     });
      //       // //   }
      //       // // } else {
      //       // const reader = new FileReader();
      //       // reader.onload = readerEvent => {
      //       //   const node = schema.nodes.image.create({
      //       //     src: readerEvent.target?.result
      //       //   });
      //       //   const transaction = view.state.tr.replaceSelectionWith(node);
      //       //   view.dispatch(transaction);
      //       // };
      //       // if (!image) return;
      //       // reader.readAsDataURL(image);
      //     }
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

          console.log(data);
          const images = data.filter(file => /image/i.test(file.type));

          event.preventDefault();
          if (images.length === 0) {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY
            });

            console.log("schemanodes:", schema.nodes)
            data.forEach(async item => {
              addFile(item);
              const reader = new FileReader();
              reader.onload = readerEvent => {
                const node = schema.nodes.image.create({
                  src: readerEvent.target?.result,
                  href:
                    "http://homestead.test/resources/ideas/f40eb735-13cd-42e7-89f2-747cf15f69f3?id=641abeb4-b33f-4bde-872d-f2f47e0c634a",
                  title: item.name
                });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              };
              reader.readAsDataURL(item);
            });
            return false;
          }

          const { schema } = view.state;
          console.log(schema.nodes);

          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY
          });
          images.forEach(async image => {
            addFile(image);
            const reader = new FileReader();
            reader.onload = readerEvent => {
              const node = schema.nodes.image.create({
                src: readerEvent.target?.result,
                title: image.name
              });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(image);
          });
          return false;
        }
      }
    }
  });
};
