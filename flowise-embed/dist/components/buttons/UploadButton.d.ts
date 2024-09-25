import { JSX } from 'solid-js/jsx-runtime';
type UploadButtonProps = {
    buttonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    text?: string | '';
    backgroundColor?: string;
    border?: string;
    color?: string;
    onClick?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const UploadButton: (props: UploadButtonProps) => JSX.Element;
export {};
//# sourceMappingURL=UploadButton.d.ts.map