import { constants } from '@/constants';

const apiHost = constants.apiUtilsUrl;
export const pdfToText = async (file: Blob): Promise<Response> => {
  const form = new FormData();
  form.append('file', file);
  return fetch(`${apiHost}/text-extraction/plain-text`, {
    method: 'POST',
    body: form,
  });
};
