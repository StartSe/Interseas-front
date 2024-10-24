import { Show, onMount, Setter, createSignal } from 'solid-js';
import { Avatar } from '../avatars/Avatar';
import { Marked } from '@ts-stack/markdown';
import { IAction, MessageType } from '../Bot';
import { messageUtils } from '@/utils/messageUtils';
import { colorTheme } from '@/utils/colorUtils';

type Props = {
  message: MessageType;
  chatflowid: string;
  chatId: string;
  apiHost?: string;
  fileAnnotations?: any;
  showAvatar?: boolean;
  avatarSrc?: string;
  backgroundColor?: string;
  textColor?: string;
  chatFeedbackStatus?: boolean;
  fontSize?: number;
  feedbackColor?: string;
  isLoading: boolean;
  showAgentMessages?: boolean;
  handleActionClick: (label: string, action: IAction | undefined | null) => void;
  setMessages: Setter<MessageType[]>;
  handleSubmit: (inputValue: string, action?: IAction | null) => void;
  disabled?: boolean;
  clearChat: () => void;
};

const [isDisabled, setIsDisabled] = createSignal(false);

const defaultBackgroundColor = colorTheme.secondaryColor;
const defaultTextColor = colorTheme.black;
const defaultFontSize = 16;
const DefaultButtonValues = {
  backgroundColor: colorTheme.terciaryColor,
  color: colorTheme.backgroundColor,
  text: '',
};

Marked.setOptions({ isNoP: true });

export const SelectionBubble = (props: Props) => {
  let botMessageEl: HTMLDivElement | undefined;
  let botDetailsEl: HTMLDetailsElement | undefined;

  onMount(() => {
    setIsDisabled(false);
    if (botMessageEl) {
      botMessageEl.innerHTML = Marked.parse(props.message.message);
      botMessageEl.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
      });
    }

    if (botDetailsEl && props.isLoading) {
      botDetailsEl.open = true;
    }
  });

  const onClick = (label: string) => {
    props.setMessages((prevMessages) => [...prevMessages, { message: label, type: 'userMessage' }]);
    if (label === 'Sim') {
      props.setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: messageUtils.NCM_DISCOVER_TEMPLATE,
          type: 'apiMessage',
        },
      ]);
    }
    if (label === 'Não') {
      props.setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: messageUtils.CRITICAL_ANALYSIS_TEMPLATE,
          type: 'apiMessage',
        },
      ]);
    }
    setIsDisabled(true);
    return;
  };

  return (
    <div>
      <div class="flex flex-row justify-start mb-2 items-start host-container" style={{ 'margin-right': '50px' }}>
        <Show when={props.showAvatar}>
          <Avatar initialAvatarSrc={props.avatarSrc} />
        </Show>
        <div class="flex flex-col justify-start">
          {props.message.message && (
            <div
              style={{
                'background-color': props.backgroundColor ?? defaultBackgroundColor,
                color: props.textColor ?? defaultTextColor,
                'border-radius': '6px',
                'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
              }}
              class="px-4 py-2 ml-2 max-w-full chatbot-host-bubble prose"
            >
              <span ref={botMessageEl} data-testid="host-bubble" />
              <div
                style={{
                  display: isDisabled() ? 'none' : 'flex',
                  'margin-bottom': isDisabled() ? '0px' : '5px',
                  'flex-direction': 'row',
                  'margin-top': '5px',
                }}
              >
                <div class={'flex w-full justify-center'}>
                  <button
                    onClick={() => onClick('Sim')}
                    class={
                      'py-2 px-10 font-semibold uppercase focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 '
                    }
                    style={{
                      background: DefaultButtonValues.backgroundColor,
                      color: DefaultButtonValues.color,
                      'margin-right': '3px',
                    }}
                  >
                    Sim
                  </button>
                </div>
                <div class={'flex w-full justify-center'}>
                  <button
                    onClick={() => onClick('Não')}
                    class={
                      'py-2 px-10 font-semibold uppercase focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 '
                    }
                    style={{
                      background: DefaultButtonValues.backgroundColor,
                      color: DefaultButtonValues.color,
                    }}
                  >
                    Não
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
