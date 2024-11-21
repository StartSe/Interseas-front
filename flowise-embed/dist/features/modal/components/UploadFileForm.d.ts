import { ButtonInputTheme } from '@/features/bubble/types';
import { UploadFile } from '@solid-primitives/upload';
type Props = {
    onSubmit: (files: UploadFile[]) => void;
    buttonInput?: ButtonInputTheme;
    uploadLabel?: string;
    modalTitle?: string;
    uploadingButtonLabel?: string;
    errorMessage?: string;
    uploadLimit?: number;
};
export declare const UploadFileForm: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=UploadFileForm.d.ts.map