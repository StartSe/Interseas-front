import { JSX } from 'solid-js/jsx-runtime';
type UploadButtonProps = {
    buttonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    text?: string;
    onClick?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const ButtomUpload: (props: UploadButtonProps) => JSX.Element;
export {};
//# sourceMappingURL=UploadButton.d.ts.map