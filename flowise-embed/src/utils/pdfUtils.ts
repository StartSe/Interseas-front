// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pdfjsLib is being loaded on index.html through <script> tag
const pdfjsLib = window.pdfjsLib;

const readFileData = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

const convertPdfToImages = async (file: File) => {
  const images: string[] = [];
  const data = (await readFileData(file)) as string;
  const pdf = await pdfjsLib.getDocument(data).promise;
  const canvas = document.createElement('canvas');

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 2.5 });
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    images.push(canvas.toDataURL());
  }

  canvas.remove();
  return images;
};

const mergeImages = async (images: string[]) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageObjects = await Promise.all(
    images.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }),
  );

  canvas.width = Math.max(...imageObjects.map((img) => img.width));
  canvas.height = imageObjects.reduce((totalHeight, img) => totalHeight + img.height, 0);

  let offsetY = 0;
  for (const img of imageObjects) {
    context.drawImage(img, 0, offsetY);
    offsetY += img.height;
  }

  return canvas.toDataURL();
};

const base64ToFile = (base64String: string, fileName: string, fileType: string): File => {
  const byteCharacters = window.atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: fileType });
  return new File([blob], fileName, { type: fileType });
};

export const convertPdfToSingleImage = async (file: File) => {
  const images = await convertPdfToImages(file);
  const mergedImage = await mergeImages(images);
  const base64String = mergedImage.split(',')[1];
  const imageFileName = file.name.replace('.pdf', '.png');
  const imageType = 'image/png';

  const imageFile = base64ToFile(base64String, imageFileName, imageType);
  return imageFile;
};

export const convertPdfToMultipleImages = async (file: File) => {
  const images = await convertPdfToImages(file);
  const files: File[] = [];

  for (const image of images) {
    const base64String = image.split(',')[1];
    const imageFileName = file.name.replace('.pdf', '.png');
    const imageType = 'image/png';

    const imageFile = base64ToFile(base64String, imageFileName, imageType);
    files.push(imageFile);
  }

  return files;
};
