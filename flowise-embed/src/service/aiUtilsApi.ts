import { constants } from '@/constants';

const apiHost = constants.apiUtilsUrl;
export const pdfToText = async (file: Blob): Promise<Response> => {
  const form = new FormData();
  form.append('file', file);

  const timeout_seconds = 10;
  const signal = AbortSignal.timeout(timeout_seconds * 1000);

  return fetch(`${apiHost}/text-extraction/plain-text`, {
    method: 'POST',
    body: form,
    signal: signal,
  });
};
