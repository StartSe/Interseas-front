// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import UnstructuredService from '@/service/UnstructuredService';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const pdfjsLib = window.pdfjsLib;

interface TextItem {
  str: string;
}

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

const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
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

export const pdfToText = async (blob: Blob): Promise<string> => {
  try {
    const service = new UnstructuredService();
    return service.pdfToText(blob);
  } catch (error) {
    const file = blobToFile(blob, 'convertedFile.pdf');
    return extractTextLocally(file);
  }
};

export const pdfToSHA256 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsArrayBuffer(blob);

    reader.onloadend = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

        // Convertendo o ArrayBuffer para uma string hexadecimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };
  });
};

interface IPageTextContent {
  items: { str: string }[];
}

const extractTextLocally = async (file: File): Promise<string> => {
  try {
    const fileData = (await readFileData(file)) as string;
    const pdfDocument = await pdfjsLib.getDocument(fileData).promise;

    const pageTextPromises = [];
    for (let pageIndex = 1; pageIndex <= pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex);
      const textContent: IPageTextContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join('');
      pageTextPromises.push(pageText);
    }

    const pageTexts = await Promise.all(pageTextPromises);
    const extractedText = pageTexts.join('');
    if (!extractedText) {
      throw new Error('No text extracted from PDF');
    }
    return extractedText;
  } catch (error) {
    console.error('Error during local text extraction:', error);
    throw error;
  }
};

const convertToBase64 = (input: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(',')[1];
      resolve(base64data || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(input);
  });
};
