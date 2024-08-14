import { UploadFile } from '@solid-primitives/upload';
type Props = {
    file: UploadFile;
    onDelete: () => void;
    index: number;
    removeritem: (index: number) => void;
    error: boolean;
    item: string;
};
export declare const UploadFileItem: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=UploadFileItem.d.ts.map