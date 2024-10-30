import { Setter } from 'solid-js';
import { FileEvent, UploadsConfig } from '@/components/Bot';
import { UploadFile } from '@solid-primitives/upload';
type Props = {
    placeholder?: string;
    backgroundColor?: string;
    textColor?: string;
    sendButtonColor?: string;
    defaultValue?: string;
    fontSize?: number;
    disabled?: boolean;
    onSubmit: (value: string) => void;
    uploadsConfig?: Partial<UploadsConfig>;
    setPreviews: Setter<unknown[]>;
    onMicrophoneClicked: () => void;
    handleFileChange: (event: FileEvent<HTMLInputElement>) => void;
    maxChars?: number;
    maxCharsWarningMessage?: string;
    autoFocus?: boolean;
    sendMessageSound?: boolean;
    sendSoundLocation?: string;
    startProcessingFiles: (files: UploadFile[]) => Promise<void>;
};
export declare const TextInput: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=TextInput.d.ts.map