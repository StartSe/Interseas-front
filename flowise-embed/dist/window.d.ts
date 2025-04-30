import { observersConfigType } from './components/Bot';
import { BubbleTheme } from './features/bubble/types';
import { MenuProps } from './features/menu';
import { HomeProps } from './pages/Home/Home';
type BotProps = {
    chatflowid: string;
    apiHost?: string;
    onRequest?: (request: RequestInit) => Promise<void>;
    chatflowConfig?: Record<string, unknown>;
    observersConfig?: observersConfigType;
    theme?: BubbleTheme;
};
export declare const initFull: (props: BotProps & {
    id?: string;
}) => void;
export declare const init: (props: BotProps) => void;
export declare const initMenu: (props: MenuProps) => void;
export declare const initHome: (props: HomeProps) => void;
export declare const destroy: () => void;
type Chatbot = {
    initFull: typeof initFull;
    init: typeof init;
    destroy: typeof destroy;
    initMenu: typeof initMenu;
    initHome: typeof initHome;
};
export declare const parseChatbot: () => {
    initFull: (props: BotProps & {
        id?: string;
    }) => void;
    init: (props: BotProps) => void;
    destroy: () => void;
    initMenu: (props: MenuProps) => void;
    initHome: (props: HomeProps) => void;
};
export declare const injectChatbotInWindow: (bot: Chatbot) => void;
export {};
//# sourceMappingURL=window.d.ts.map