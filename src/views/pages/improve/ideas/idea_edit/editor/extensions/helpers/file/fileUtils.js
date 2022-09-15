import {
  FILE_SIZE_LIMIT,
  VALID_EXTERNAL_URL_REGEX,
  VALID_BASE64URL_REGEX,
  SUPPORTED_PREVIEW_RESIZE_IMAGE_TYPES
} from "./constants";

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

const formatFileSize = (bytes, decimalPoint) => {
  if (bytes == 0) return "0 Bytes";
  const k = 1000;
  const dm = decimalPoint || 2;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const validateFileSize = (notify, file) => {
  let valid = true;

  if (file.size > FILE_SIZE_LIMIT) {
    const data = {
      file: file.name,
      size: formatFileSize(file.size, 2),
      limit: formatFileSize(FILE_SIZE_LIMIT)
    };
    notify("File size too big", data);
    console.log("ERROR, File size too big!");
    valid = false;
  }
  return valid;
};

const base64Resize = (sourceBase64, toWidth, _type, callback) => {
  let type = _type;

  if (!SUPPORTED_PREVIEW_RESIZE_IMAGE_TYPES.includes(type)) {
    callback(sourceBase64);
    return;
  }

  const img = document.createElement("img");
  img.setAttribute("src", sourceBase64);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = toWidth / img.width;

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d");
    const maxW = img.width * scale;
    const maxH = img.height * scale;

    const iw = img.width;
    const ih = img.height;
    const scl = Math.min(maxW / iw, maxH / ih);
    const iwScaled = iw * scl;
    const ihScaled = ih * scl;
    canvas.width = iwScaled;
    canvas.height = ihScaled;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    console.log("scale: ")
    console.log(iwScaled)
    console.log(ihScaled)
    ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
    const newBase64 = canvas.toDataURL(type, scl);

    callback(newBase64);
  };
  img.onerror = function() {
    console.log("Could not resize image");
  };
};

const isValidExternalUrl = url => {
  return new RegExp(VALID_EXTERNAL_URL_REGEX).test(url);
};

const isBase64 = url => {
  return new RegExp(VALID_BASE64URL_REGEX).test(url);
};

const getBase64FromUrl = async url => {
  if (isBase64(url)) return url;
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

const base64MimeType = base64String => {
  var result = null;

  if (typeof base64String !== "string") {
    return result;
  }

  var mime = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
};

const base64ToFile = (base64String, properties) => {
  const { name, type } = properties;
  const file = new File([new Blob([base64String])], name, { type });
  return file;
};

const getBase64FromFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export {
  fileWithUniqueName,
  validateFileSize,
  getUniqueFileName,
  base64Resize,
  isValidExternalUrl,
  getBase64FromUrl,
  isBase64,
  getBase64FromFile,
  base64MimeType,
  base64ToFile
};
