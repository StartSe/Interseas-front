declare global {
    interface Window {
        pdfjsLib: any;
    }
}
export declare const convertPdfToSingleImage: (file: File) => Promise<File>;
export declare const convertPdfToMultipleImages: (file: File) => Promise<File[]>;
export declare const pdfToText: (blob: Blob) => Promise<string>;
export declare const pdfToHash: (blob: Blob) => Promise<string>;
export declare const extractNewFileProperties: (fileName: string) => {
    fileName: string;
    version: string | number;
};
//# sourceMappingURL=pdfUtils.d.ts.map