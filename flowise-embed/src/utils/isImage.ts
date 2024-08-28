const acceptedImageExtensions = ['png', 'jpg', 'jpeg'];

export const isImage = (filename: string): boolean => {
  const ext = filename.split('.').reverse()[0];
  return acceptedImageExtensions.includes(ext);
};
