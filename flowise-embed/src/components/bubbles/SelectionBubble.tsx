import { Show, onMount, For, Setter } from 'solid-js';
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
  clearChat: () => void;
  selectionOptions: string[];
  isDisabled: boolean;
  setIsDisabled: () => void;
  messageIndex: number;
  printCriticalAnalysisData: () => void;
};

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
  let botMessageElement: HTMLDivElement | undefined;
  let botDetailsElement: HTMLDetailsElement | undefined;

  onMount(() => {
    if (botMessageElement) {
      botMessageElement.innerHTML = Marked.parse(props.message.message);
      botMessageElement.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
      });
    }

    if (botDetailsElement && props.isLoading) {
      botDetailsElement.open = true;
    }
  });

  const onClick = (label: string) => {
    props.setMessages((prevMessages) => [...prevMessages, { message: label, type: 'userMessage' }]);
    if (label === props.selectionOptions[0]) {
      props.setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: messageUtils.NCM_DISCOVER_TEMPLATE,
          type: 'apiMessage',
        },
      ]);
    }
    if (label === props.selectionOptions[1]) {
      props.printCriticalAnalysisData();
    }
    props.setIsDisabled();
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
              <span ref={botMessageElement} data-testid="host-bubble" />
              <div
                style={{
                  display: 'flex',
                  'margin-bottom': '5px',
                  'flex-direction': 'row',
                  'margin-top': '5px',
                }}
              >
                <For each={props.selectionOptions} fallback={<></>}>
                  {(option, index) => (
                    <div class={'flex w-full justify-center'}>
                      <button
                        onClick={() => onClick(option)}
                        class={
                          'py-2 px-10 font-semibold uppercase focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 '
                        }
                        style={{
                          background: DefaultButtonValues.backgroundColor,
                          color: DefaultButtonValues.color,
                          'margin-right': index() === props.selectionOptions.length - 1 ? '0px' : '3px',
                        }}
                        disabled={props.isDisabled}
                      >
                        {option}
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
