import { UploadFile } from '@solid-primitives/upload';
type Props = {
    file: UploadFile;
    index: number;
    removeFile: (index: number) => void;
    error: boolean;
    errorMessage?: string;
};
export declare const UploadFileItem: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=UploadFileItem.d.ts.map