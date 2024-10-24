import { observersConfigType } from './components/Bot';
import { MenuProps } from './features/menu';
import { HomeProps } from './pages/Home/Home';

/* eslint-disable solid/reactivity */
type BotProps = {
  chatflowid: string;
  apiHost?: string;
  chatflowConfig?: Record<string, unknown>;
  observersConfig?: observersConfigType;
};

let elementUsed: Element | undefined;

export const initFull = (props: BotProps & { id?: string }) => {
  destroy();
  const fullElement = props.id ? document.getElementById(props.id) : document.querySelector('flowise-fullchatbot');
  if (!fullElement) throw new Error('<flowise-fullchatbot> element not found.');
  Object.assign(fullElement, props);
  elementUsed = fullElement;
};

export const init = (props: BotProps) => {
  destroy();
  const element = document.createElement('flowise-chatbot');
  Object.assign(element, props);
  document.body.appendChild(element);
  elementUsed = element;
};

export const initMenu = (props: MenuProps) => {
  const element = document.querySelector('flowise-menu');
  if (!element) throw new Error('<flowise-menu> element not found.');
  Object.assign(element, props);
};

export const initHome = (props: HomeProps) => {
  destroy();
  const fullElement = document.querySelector('flowise-home');
  if (!fullElement) throw new Error('<flowise-home> element not found.');
  Object.assign(fullElement, props);
  elementUsed = fullElement;
};

export const destroy = () => {
  elementUsed?.remove();
};

type Chatbot = {
  initFull: typeof initFull;
  init: typeof init;
  destroy: typeof destroy;
  initMenu: typeof initMenu;
  initHome: typeof initHome;
};

declare const window:
  | {
      Chatbot: Chatbot | undefined;
    }
  | undefined;

export const parseChatbot = () => ({
  initFull,
  init,
  destroy,
  initMenu,
  initHome,
});

export const injectChatbotInWindow = (bot: Chatbot) => {
  if (typeof window === 'undefined') return;
  window.Chatbot = { ...bot };
};
