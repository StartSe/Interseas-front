import { observersConfigType } from './components/BotCriticalAnalysis';
type BotProps = {
    chatflowid: string;
    apiHost?: string;
    chatflowConfig?: Record<string, unknown>;
    observersConfig?: observersConfigType;
};
export declare const initFull: (props: BotProps & {
    id?: string;
}) => void;
export declare const init: (props: BotProps) => void;
export declare const destroy: () => void;
type Chatbot = {
    initFull: typeof initFull;
    init: typeof init;
    destroy: typeof destroy;
};
export declare const parseChatbotAnalise: () => {
    initFull: (props: BotProps & {
        id?: string;
    }) => void;
    init: (props: BotProps) => void;
    destroy: () => void;
};
export declare const injectChatbotInWindowAnalise: (bot: Chatbot) => void;
export {};
//# sourceMappingURL=windowCriticalAnalysis.d.ts.map