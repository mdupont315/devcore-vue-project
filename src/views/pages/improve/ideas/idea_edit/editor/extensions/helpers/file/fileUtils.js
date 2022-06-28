import { FILE_SIZE_LIMIT } from "./constants";

// const addCounterToFileName = (name, counter) => {
//   const splitFileName = name.split(".").pop();
//   let fileName = name.replace(`.${splitFileName}`, "");
//   const chars = [...fileName];
//   let index = 0;
//   console.log(counter);
//   if (counter > 0) {
//     let copyNumber = 0;
//     for (var i = chars.length; i > 0; i--) {
//       if (chars[i] === "(") {
//         index = i;
//         break;
//       } else {
//         index = chars.length;
//       }
//     }
//     let parseCopyNumber = chars.slice(index, chars.length);
//     fileName = chars.slice(0, index).join("");
//     copyNumber = parseInt(parseCopyNumber.join("").replace(/\D/g, ""));
//     console.log(copyNumber);
//     if (Number.isNaN(copyNumber)) {
//       return `${fileName}(1).${splitFileName}`;
//     }
//     return `${fileName}(${copyNumber + 1}).${splitFileName}`;
//   } else {
//     return `${fileName}(1).${splitFileName}`;
//   }
// };

const addCounterToFileName = (name, counter) => {
  const fileName = getFileName(name);
  const extension = getExtension(name);
  if (counter > 0) {
    return `${fileName}(${counter}).${extension}`;
  } else {
    return `${fileName}.${extension}`;
  }
};

const getExtension = name => name.split(".").pop();
const getFileName = name => name.replace(`.${getExtension(name)}`, "");

const getSimilarNamesFromContent = (fileNodes, name) => {
  return fileNodes.filter(node => {
    return (
      getExtension(node.attrs.title).toUpperCase() ===
        getExtension(name).toUpperCase() &&
      node.attrs.title.includes(getFileName(name))
    );
  });
};

// const findUniqueName = (items, name) => {
//   return new Promise(resolve => {
//     let counter = 0;
//     const isUnique = (items, name) => {
//       return items.filter(node => node.attrs.title === name).length === 0;
//     };

//     const recurse = (items, name) => {
//       if (isUnique(items, name)) {
//         return resolve(name);
//       } else {
//         let newName = name;
//         newName = addCounterToFileName(name, counter);
//         counter += 1;
//         recurse(items, newName);
//       }
//     };

//     return recurse(items, name);
//   });
// };

const findUniqueName = (items, name) => {
  let fileNames = items.length > 0 ? items.map(node => node.attrs.title) : [];
  let newName = name;
  const isUnique = (fileNames, name) => {
    return fileNames.filter(fileName => fileName === name).length === 0;
  };
  // return name
  if (isUnique(fileNames, name)) {
    return newName;
  } else {
    // return name appended with (counter)
    newName = addCounterToFileName(newName, items.length);
  }

  return newName;
};

const getUniqueFileName = (view, name) => {
  const { doc } = view.state;
  const { content } = doc.content;
  let fileTitle = name;
  const fileNodes = content.filter(
    node => node.type && node.type.name === "file"
  );
  const sameNameFiles = getSimilarNamesFromContent(fileNodes, name);
  if (sameNameFiles.length > 0) {
    fileTitle = findUniqueName(sameNameFiles, fileTitle);
  }
  return fileTitle;
};

const fileWithUniqueName = (view, originalFile) => {
  const newName = getUniqueFileName(view, originalFile.name);
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified
  });
};

const validateFileSize = (notify, file) => {
  let valid = true;
  if (file.size > FILE_SIZE_LIMIT) {
    notify(file, FILE_SIZE_LIMIT);
    console.log("ERROR, File size too big!");
    valid = false;
  }
  return valid;
};

export { fileWithUniqueName, validateFileSize, getUniqueFileName };
