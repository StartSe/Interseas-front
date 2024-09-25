import { JSX } from 'solid-js/jsx-runtime';
type SendButtonProps = {
    sendButtonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
type NewItemButtonProps = {
    newItemText: string;
    textColor?: string;
    borderColor?: string;
} & SendButtonProps;
export declare const SendButton: (props: SendButtonProps) => JSX.Element;
export declare const NewItemButton: (props: NewItemButtonProps) => JSX.Element;
export declare const Spinner: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
export {};
//# sourceMappingURL=SendButton.d.ts.map