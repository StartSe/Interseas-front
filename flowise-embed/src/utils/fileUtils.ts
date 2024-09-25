import { UploadFile } from '@solid-primitives/upload';

export type FileMapping = {
  file: UploadFile;
  checklist?: string;
  type: string;
  content?: object | any[];
  filledChecklist?: object | any[];
};
