import { ParentProps } from 'solid-js';
import { UploadFile } from '@solid-primitives/upload';
import { ButtonInputTheme } from '@/features/bubble/types';
type Props = ParentProps & {
    isOpen: boolean;
    onClose: () => void;
    onUploadSubmit: (files: UploadFile[]) => void;
    buttonInput?: ButtonInputTheme;
    modalTitle?: string;
    uploadLabel?: string;
    uploadingButtonLabel?: string;
    errorMessage?: string;
};
export declare const FileUploadModal: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=FileUploadModal.d.ts.map