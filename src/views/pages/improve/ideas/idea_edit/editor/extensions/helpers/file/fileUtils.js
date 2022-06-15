import { FILE_SIZE_LIMIT } from "./constants";

const addCounterToFileName = (name, counter) => {
  const splitFileName = name.split(".").pop();
  let fileName = name.replace(`.${splitFileName}`, "");
  const chars = [...fileName];
  let index = 0;
  if (counter > 0) {
    let copyNumber = 0;
    for (var i = chars.length; i > 0; i--) {
      if (chars[i] === "(") {
        index = i;
        break;
      } else {
        index = chars.length;
      }
    }
    let parseCopyNumber = chars.slice(index, chars.length);
    fileName = chars.slice(0, index).join("");
    copyNumber = parseInt(parseCopyNumber.join("").replace(/\D/g, ""));
    if (Number.isNaN(copyNumber)) {
      return `${fileName}(1).${splitFileName}`;
    }
    return `${fileName}(${copyNumber + 1}).${splitFileName}`;
  } else {
    return `${fileName}(1).${splitFileName}`;
  }
};

const getSimilarNamesFromContent = (fileNodes, name) => {
  const extension = name =>
    name
      .split(".")
      .pop()
      .toUpperCase();
  return fileNodes.filter(node => {
    return (
      extension(node.attrs.title) === extension(name) &&
      node.attrs.title === name
    );
  });
};

const findUniqueName = (items, name) => {
  return new Promise(resolve => {
    let counter = 0;
    const isUnique = (items, name) => {
      return items.filter(node => node.attrs.title === name).length === 0;
    };

    const recurse = (items, name) => {
      if (isUnique(items, name)) {
        return resolve(name);
      } else {
        let newName = name;
        newName = addCounterToFileName(name, counter);
        counter += 1;
        recurse(items, newName);
      }
    };

    return recurse(items, name);
  });
};

const getUniqueFileName = async (view, item) => {
  const { doc } = view.state;
  const { content } = doc.content;
  let fileTitle = item.name;
  const fileNodes = content.filter(
    node => node.type && node.type.name === "file"
  );
  const sameNameFiles = getSimilarNamesFromContent(fileNodes, item.name);
  if (sameNameFiles.length > 0) {
    fileTitle = await findUniqueName(fileNodes, fileTitle);
  }
  return fileTitle;
};

const fileWithUniqueName = async (view, originalFile) => {
  const newName = await getUniqueFileName(view, originalFile);
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

export { fileWithUniqueName, validateFileSize };
