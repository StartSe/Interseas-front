import { UploadFile } from '@solid-primitives/upload';
export type DatabaseProvidedFile = {
    name: string;
    mime: string;
    hash: string;
};
export type FileMapping = {
    file: UploadFile | DatabaseProvidedFile;
    checklist?: string;
    type: string;
    content?: object | any[];
    filledChecklist?: object | any[];
};
//# sourceMappingURL=fileUtils.d.ts.map