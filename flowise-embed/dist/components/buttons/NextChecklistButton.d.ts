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
    checklistNumber?: number;
    currentChecklistNumber?: number;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const NextChecklistButton: (props: UploadButtonProps) => JSX.Element;
export {};
//# sourceMappingURL=NextChecklistButton.d.ts.map