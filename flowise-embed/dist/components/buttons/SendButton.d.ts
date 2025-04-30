import { JSX } from 'solid-js/jsx-runtime';
type SendButtonProps = {
    sendButtonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
type DeleteButtonProps = {
    newItemText: string;
    textColor?: string;
    borderColor?: string;
} & SendButtonProps;
export declare const SendButton: (props: SendButtonProps) => JSX.Element;
export declare const DeleteButton: (props: DeleteButtonProps) => JSX.Element;
export declare const Spinner: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
export {};
//# sourceMappingURL=SendButton.d.ts.map