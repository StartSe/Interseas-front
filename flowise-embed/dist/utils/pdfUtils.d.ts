declare global {
    interface Window {
        pdfjsLib: any;
    }
}
export declare const convertPdfToSingleImage: (file: File) => Promise<File>;
export declare const convertPdfToMultipleImages: (file: File) => Promise<File[]>;
export declare const pdfToText: (blob: Blob) => Promise<string>;
//# sourceMappingURL=pdfUtils.d.ts.map