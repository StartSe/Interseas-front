import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageQuery, isStreamAvailableQuery, IncomingInput, getChatbotConfig } from '@/queries/sendMessageQueryAnalise';
import { GuestBubble } from '@/components/bubblesCriticalAnalysis/GuestBubble';
import { BotBubble } from '@/components/bubblesCriticalAnalysis/BotBubble';
import { SourceBubble } from '@/components/bubblesCriticalAnalysis/SourceBubble';
import { BotMessageTheme, FooterTheme, TextInputTheme, UserMessageTheme, FeedbackTheme } from '@/features/bubble/types';
import { Badge } from '@/components/BadgeAnalise';
import socketIOClient from 'socket.io-client';
import { Avatar } from '@/components/avatars/Avatar';
import { NewItemButton } from '@/components/buttons/SendButton';
import { LeadCaptureBubble } from '@/components/bubblesCriticalAnalysis/LeadCaptureBubble';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { UploadButton } from '@/components/buttons/UploadButton';
import { messageUtils } from '@/utils/messageUtils';
import { FileUploadModal } from '@/features/modalCriticalAnalysis/FileUploadModal';

export type FileEvent<T = EventTarget> = {
  target: T;
};

export type FormEvent<T = EventTarget> = {
  preventDefault: () => void;
  currentTarget: T;
};

type ImageUploadConstraits = {
  fileTypes: string[];
  maxUploadSize: number;
};

export type UploadsConfig = {
  imgUploadSizeAndTypes: ImageUploadConstraits[];
  isImageUploadAllowed: boolean;
  isSpeechToTextEnabled: boolean;
};

type FilePreviewData = string | ArrayBuffer;

type FilePreview = {
  data: FilePreviewData;
  mime: string;
  name: string;
  preview: string;
  type: string;
};

type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting' | 'leadCaptureMessage';

export type IAgentReasoning = {
  agentName?: string;
  messages?: string[];
  usedTools?: any[];
  sourceDocuments?: any[];
  instructions?: string;
  nextAgent?: string;
};

export type IAction = {
  id?: string;
  elements?: Array<{
    type: string;
    label: string;
  }>;
  mapping?: {
    approve: string;
    reject: string;
    toolCalls: any[];
  };
};

export type FileUpload = Omit<FilePreview, 'preview'>;

export type MessageType = {
  messageId?: string;
  message: string;
  type: messageType;
  sourceDocuments?: any;
  fileAnnotations?: any;
  fileUploads?: Partial<FileUpload>[];
  agentReasoning?: IAgentReasoning[];
  action?: IAction | null;
};

type observerConfigType = (accessor: string | boolean | object | MessageType[]) => void;
export type observersConfigType = Record<'observeUserInput' | 'observeLoading' | 'observeMessages', observerConfigType>;

export type BotPropsCriticalAnalysis = {
  chatflowid: string;
  apiHost?: string;
  chatflowConfig?: Record<string, unknown>;
  welcomeMessage?: string;
  errorMessage?: string;
  botMessage?: BotMessageTheme;
  userMessage?: UserMessageTheme;
  textInput?: TextInputTheme;
  feedback?: FeedbackTheme;
  poweredByTextColor?: string;
  badgeBackgroundColor?: string;
  bubbleBackgroundColor?: string;
  bubbleTextColor?: string;
  showTitle?: boolean;
  showAgentMessages?: boolean;
  title?: string;
  titleAvatarSrc?: string;
  fontSize?: number;
  isFullPage?: boolean;
  footer?: FooterTheme;
  observersConfig?: observersConfigType;
  starterPrompts?: string[];
  starterPromptFontSize?: number;
};

export type LeadsConfig = {
  status: boolean;
  title?: string;
  name?: boolean;
  email?: boolean;
  phone?: boolean;
  successMessage?: string;
};

const defaultWelcomeMessage = 'Hi there! How can I help?';

export const Bot = (botProps: BotPropsCriticalAnalysis & { class?: string }) => {
  // set a default value for showTitle if not set and merge with other props
  const props = mergeProps({ showTitle: true }, botProps);
  let chatContainer: HTMLDivElement | undefined;
  let bottomSpacer: HTMLDivElement | undefined;
  let botContainer: HTMLDivElement | undefined;

  const [userInput, setUserInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [messages, setMessages] = createSignal<MessageType[]>(
    [
      {
        message: props.welcomeMessage ?? defaultWelcomeMessage,
        type: 'apiMessage',
      },
    ],
    { equals: false },
  );

  const [socketIOClientId, setSocketIOClientId] = createSignal('');
  const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] = createSignal(false);
  const [chatId, setChatId] = createSignal(
    (props.chatflowConfig?.vars as any)?.customerId ? `${(props.chatflowConfig?.vars as any).customerId.toString()}+${uuidv4()}` : uuidv4(),
  );
  const [chatFeedbackStatus, setChatFeedbackStatus] = createSignal<boolean>(false);
  const [leadsConfig, setLeadsConfig] = createSignal<LeadsConfig>();
  const [isLeadSaved, setIsLeadSaved] = createSignal(false);
  const [leadEmail, setLeadEmail] = createSignal('');
  const [uploadsConfig, setUploadsConfig] = createSignal<UploadsConfig>();

  // drag & drop file input
  // TODO: fix this type
  const [previews, setPreviews] = createSignal<FilePreview[]>([]);

  // document uploading
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = createSignal<boolean>(false);

  onMount(() => {
    if (botProps?.observersConfig) {
      const { observeUserInput, observeLoading, observeMessages } = botProps.observersConfig;
      typeof observeUserInput === 'function' &&
        // eslint-disable-next-line solid/reactivity
        createMemo(() => {
          observeUserInput(userInput());
        });
      typeof observeLoading === 'function' &&
        // eslint-disable-next-line solid/reactivity
        createMemo(() => {
          observeLoading(loading());
        });
      typeof observeMessages === 'function' &&
        // eslint-disable-next-line solid/reactivity
        createMemo(() => {
          observeMessages(messages());
        });
    }

    if (!bottomSpacer) return;
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
    }, 50);
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
    }, 50);
  };

  /**
   * Add each chat message into localStorage
   */
  const addChatMessage = (allMessage: MessageType[]) => {
    const messages = allMessage.map((item) => {
      if (item.fileUploads) {
        const fileUploads = item?.fileUploads.map((file) => ({
          type: file.type,
          name: file.name,
          mime: file.mime,
        }));
        return { ...item, fileUploads };
      }
      return item;
    });
    setLocalStorageChatflow(props.chatflowid, chatId(), { chatHistory: messages });
  };

  // TODO: this has the bug where first message is not showing: https://github.com/FlowiseAI/FlowiseChatEmbed/issues/158
  // The solution is to use SSE
  const updateLastMessage = (
    text: string,
    sourceDocuments: any,
    fileAnnotations: any,
    agentReasoning: IAgentReasoning[] = [],
    action: IAction,
    resultText: string,
  ) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, message: item.message + text, sourceDocuments, fileAnnotations, agentReasoning, action };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateLastMessageSourceDocuments = (sourceDocuments: any) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, sourceDocuments };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateLastMessageAgentReasoning = (agentReasoning: string | IAgentReasoning[]) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, agentReasoning: typeof agentReasoning === 'string' ? JSON.parse(agentReasoning) : agentReasoning };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateLastMessageAction = (action: IAction) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: typeof action === 'string' ? JSON.parse(action) : action };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
  };

  const clearPreviews = () => {
    // Revoke the data uris to avoid memory leaks
    previews().forEach((file) => URL.revokeObjectURL(file.preview));
    setPreviews([]);
  };

  // Handle errors
  const handleError = (message = 'Oops! There seems to be an error. Please try again.') => {
    setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: props.errorMessage || message, type: 'apiMessage' }];
      addChatMessage(messages);
      return messages;
    });
    setLoading(false);
    setUserInput('');
    scrollToBottom();
  };

  // Handle form submission
  const handleSubmit = async (value: string, action?: IAction | undefined | null) => {
    setUserInput(value);

    if (value.trim() === '') {
      const containsAudio = previews().filter((item) => item.type === 'audio').length > 0;
      if (!(previews().length >= 1 && containsAudio)) {
        return;
      }
    }

    setLoading(true);
    scrollToBottom();

    const urls = previews().map((item) => {
      return {
        data: item.data,
        type: item.type,
        name: item.name,
        mime: item.mime,
      };
    });

    clearPreviews();

    setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: value, type: 'userMessage', fileUploads: urls }];
      addChatMessage(messages);
      return messages;
    });

    const body: IncomingInput = {
      question: value,
      chatId: chatId(),
    };

    if (urls && urls.length > 0) body.uploads = urls;

    if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

    if (leadEmail()) body.leadEmail = leadEmail();

    if (action) body.action = action;

    if (isChatFlowAvailableToStream()) {
      body.socketIOClientId = socketIOClientId();
    } else {
      setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
    }

    const result = await sendMessageQuery({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      body,
    });

    if (result.data) {
      const data = result.data;
      const question = data.question;
      if (value === '' && question) {
        setMessages((data) => {
          const messages = data.map((item, i) => {
            if (i === data.length - 2) {
              return { ...item, message: question };
            }
            return item;
          });
          addChatMessage(messages);
          return [...messages];
        });
      }
      if (urls && urls.length > 0) {
        setMessages((data) => {
          const messages = data.map((item, i) => {
            if (i === data.length - 2) {
              if (item.fileUploads) {
                const fileUploads = item?.fileUploads.map((file) => ({
                  type: file.type,
                  name: file.name,
                  mime: file.mime,
                }));
                return { ...item, fileUploads };
              }
            }
            return item;
          });
          addChatMessage(messages);
          return [...messages];
        });
      }
      if (!isChatFlowAvailableToStream()) {
        let text = '';
        if (data.text) text = data.text;
        else if (data.json) text = JSON.stringify(data.json, null, 2);
        else text = JSON.stringify(data, null, 2);

        updateLastMessage(text, data?.sourceDocuments, data?.fileAnnotations, data?.agentReasoning, data?.action, data.text);
      } else {
        updateLastMessage('', data?.sourceDocuments, data?.fileAnnotations, data?.agentReasoning, data?.action, data.text);
      }
      setLoading(false);
      setUserInput('');
      scrollToBottom();
    }
    if (result.error) {
      const error = result.error;
      console.error(error);
      if (typeof error === 'object') {
        handleError(`Error: ${error?.message.replaceAll('Error:', ' ')}`);
        return;
      }
      if (typeof error === 'string') {
        handleError(error);
        return;
      }
      handleError();
      return;
    }
  };

  const handleActionClick = async (label: string, action: IAction | undefined | null) => {
    setUserInput(label);
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: null };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });
    handleSubmit(label, action);
  };

  const clearChat = () => {
    try {
      removeLocalStorageChatHistory(props.chatflowid);
      setChatId(
        (props.chatflowConfig?.vars as any)?.customerId ? `${(props.chatflowConfig?.vars as any).customerId.toString()}+${uuidv4()}` : uuidv4(),
      );
      const messages: MessageType[] = [
        {
          message: props.welcomeMessage ?? defaultWelcomeMessage,
          type: 'apiMessage',
        },
      ];
      if (leadsConfig()?.status && !getLocalStorageChatflow(props.chatflowid)?.lead) {
        messages.push({ message: '', type: 'leadCaptureMessage' });
      }
      setMessages(messages);
    } catch (error: any) {
      const errorData = error.response.data || `${error.response.status}: ${error.response.statusText}`;
      console.error(`error: ${errorData}`);
    }
  };

  // eslint-disable-next-line solid/reactivity
  createEffect(async () => {
    const chatMessage = getLocalStorageChatflow(props.chatflowid);
    if (chatMessage && Object.keys(chatMessage).length) {
      if (chatMessage.chatId) setChatId(chatMessage.chatId);
      const savedLead = chatMessage.lead;
      if (savedLead) {
        setIsLeadSaved(!!savedLead);
        setLeadEmail(savedLead.email);
      }
      const loadedMessages: MessageType[] =
        chatMessage?.chatHistory?.length > 0
          ? chatMessage.chatHistory?.map((message: MessageType) => {
              const chatHistory: MessageType = {
                messageId: message?.messageId,
                message: message.message,
                type: message.type,
              };
              if (message.sourceDocuments) chatHistory.sourceDocuments = message.sourceDocuments;
              if (message.fileAnnotations) chatHistory.fileAnnotations = message.fileAnnotations;
              if (message.fileUploads) chatHistory.fileUploads = message.fileUploads;
              if (message.agentReasoning) chatHistory.agentReasoning = message.agentReasoning;
              if (message.action) chatHistory.action = message.action;
              return chatHistory;
            })
          : [{ message: props.welcomeMessage ?? defaultWelcomeMessage, type: 'apiMessage' }];

      const filteredMessages = loadedMessages.filter((message) => message.message !== '' && message.type !== 'leadCaptureMessage');
      setMessages([...filteredMessages]);
    }

    // Determine if particular chatflow is available for streaming
    const { data } = await isStreamAvailableQuery({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
    });

    if (data) {
      setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
    }

    // Get the chatbotConfig
    const result = await getChatbotConfig({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
    });

    if (result.data) {
      const chatbotConfig = result.data;
      if (chatbotConfig.chatFeedback) {
        const chatFeedbackStatus = chatbotConfig.chatFeedback.status;
        setChatFeedbackStatus(chatFeedbackStatus);
      }
      if (chatbotConfig.leads) {
        setLeadsConfig(chatbotConfig.leads);
        if (chatbotConfig.leads?.status && !getLocalStorageChatflow(props.chatflowid)?.lead) {
          setMessages((prevMessages) => [...prevMessages, { message: '', type: 'leadCaptureMessage' }]);
        }
      }
    }

    const socket = socketIOClient(props.apiHost as string);

    socket.on('connect', () => {
      setSocketIOClientId(socket.id);
    });

    socket.on('start', () => {
      setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
    });

    socket.on('sourceDocuments', updateLastMessageSourceDocuments);

    socket.on('agentReasoning', updateLastMessageAgentReasoning);

    socket.on('action', updateLastMessageAction);

    socket.on('token', updateLastMessage);

    // eslint-disable-next-line solid/reactivity
    return () => {
      setUserInput('');
      setLoading(false);
      setMessages([
        {
          message: props.welcomeMessage ?? defaultWelcomeMessage,
          type: 'apiMessage',
        },
      ]);
      if (socket) {
        socket.disconnect();
        setSocketIOClientId('');
      }
    };
  });

  const isValidURL = (url: string): URL | undefined => {
    try {
      return new URL(url);
    } catch (err) {
      return undefined;
    }
  };

  const removeDuplicateURL = (message: MessageType) => {
    const visitedURLs: string[] = [];
    const newSourceDocuments: any = [];

    message.sourceDocuments.forEach((source: any) => {
      if (isValidURL(source.metadata.source) && !visitedURLs.includes(source.metadata.source)) {
        visitedURLs.push(source.metadata.source);
        newSourceDocuments.push(source);
      } else if (!isValidURL(source.metadata.source)) {
        newSourceDocuments.push(source);
      }
    });
    return newSourceDocuments;
  };

  const startProcessingFiles = () => {
    console.log('Processing files');
    setIsUploadModalOpen(false);
  };

  return (
    <>
      <div
        ref={botContainer}
        class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}
      >
        {props.showTitle ? (
          <div
            class="flex flex-row items-center w-full h-[50px] absolute top-0 left-0 z-10"
            style={{
              background: props.bubbleBackgroundColor,
              color: props.bubbleTextColor,
              'border-top-left-radius': props.isFullPage ? '0px' : '6px',
              'border-top-right-radius': props.isFullPage ? '0px' : '6px',
            }}
          >
            <Show when={props.titleAvatarSrc}>
              <>
                <div style={{ width: '15px' }} />
                <Avatar initialAvatarSrc={props.titleAvatarSrc} />
              </>
            </Show>
            <Show when={props.title}>
              <span class="px-3 whitespace-pre-wrap font-semibold max-w-full">{props.title}</span>
            </Show>
            <div style={{ flex: 1 }} />
            <div style={{ 'padding-right': '0.625rem' }}>
              <NewItemButton
                newItemText={messageUtils.NEW_CHAT_BUTTON_LABEL}
                sendButtonColor={props.bubbleTextColor}
                type="button"
                isDisabled={messages().length === 1}
                class="my-2 ml-2"
                on:click={clearChat}
              />
            </div>
          </div>
        ) : null}
        <div class="flex flex-col w-full h-full justify-start z-0">
          <div
            ref={chatContainer}
            class="overflow-y-scroll flex flex-col flex-grow min-w-full w-full px-3 pt-[70px] relative scrollable-container chatbot-chat-view scroll-smooth"
          >
            <For each={[...messages()]}>
              {(message, index) => {
                return (
                  <>
                    {message.type === 'userMessage' && (
                      <GuestBubble
                        message={message}
                        apiHost={props.apiHost}
                        chatflowid={props.chatflowid}
                        chatId={chatId()}
                        backgroundColor={props.userMessage?.backgroundColor}
                        textColor={props.userMessage?.textColor}
                        showAvatar={props.userMessage?.showAvatar}
                        avatarSrc={props.userMessage?.avatarSrc}
                        fontSize={props.fontSize}
                      />
                    )}
                    {message.type === 'apiMessage' && (
                      <BotBubble
                        message={message}
                        fileAnnotations={message.fileAnnotations}
                        chatflowid={props.chatflowid}
                        chatId={chatId()}
                        apiHost={props.apiHost}
                        backgroundColor={props.botMessage?.backgroundColor}
                        textColor={props.botMessage?.textColor}
                        feedbackColor={props.feedback?.color}
                        showAvatar={props.botMessage?.showAvatar}
                        avatarSrc={props.botMessage?.avatarSrc}
                        chatFeedbackStatus={chatFeedbackStatus()}
                        fontSize={props.fontSize}
                        isLoading={loading() && index() === messages().length - 1}
                        showAgentMessages={props.showAgentMessages}
                        handleActionClick={(label, action) => handleActionClick(label, action)}
                      />
                    )}
                    {message.type === 'leadCaptureMessage' && leadsConfig()?.status && !getLocalStorageChatflow(props.chatflowid)?.lead && (
                      <LeadCaptureBubble
                        message={message}
                        chatflowid={props.chatflowid}
                        chatId={chatId()}
                        apiHost={props.apiHost}
                        backgroundColor={props.botMessage?.backgroundColor}
                        textColor={props.botMessage?.textColor}
                        fontSize={props.fontSize}
                        showAvatar={props.botMessage?.showAvatar}
                        avatarSrc={props.botMessage?.avatarSrc}
                        leadsConfig={leadsConfig()}
                        sendButtonColor={props.textInput?.sendButtonColor}
                        isLeadSaved={isLeadSaved()}
                        setIsLeadSaved={setIsLeadSaved}
                        setLeadEmail={setLeadEmail}
                      />
                    )}
                    {message.sourceDocuments && message.sourceDocuments.length && (
                      <div style={{ display: 'flex', 'flex-direction': 'row', width: '100%', 'flex-wrap': 'wrap' }}>
                        <For each={[...removeDuplicateURL(message)]}>
                          {(src) => {
                            const URL = isValidURL(src.metadata.source);
                            return (
                              <SourceBubble
                                pageContent={URL ? URL.pathname : src.pageContent}
                                metadata={src.metadata}
                                onSourceClick={() => {
                                  window.open(src.metadata.source, '_blank');
                                }}
                              />
                            );
                          }}
                        </For>
                      </div>
                    )}
                  </>
                );
              }}
            </For>
          </div>
          <div class="w-full px-5 pt-2 pb-1">
            {
              <>
                <UploadButton
                  onClick={() => setIsUploadModalOpen(true)}
                  text={messageUtils.UPLOAD_BUTTON_LABEL}
                  disabled={isUploadButtonDisabled()}
                />
                <FileUploadModal
                  isOpen={isUploadModalOpen()}
                  onClose={() => setIsUploadModalOpen(false)}
                  onUploadSubmit={startProcessingFiles}
                  modalTitle={messageUtils.MODAL_TITLE}
                  uploadLabel={messageUtils.UPLOADING_LABEL}
                  uploadingButtonLabel={messageUtils.MODAL_BUTTON}
                  errorMessage={messageUtils.FILE_TYPE_NOT_SUPPORTED}
                />
              </>
            }
          </div>
          <Badge
            footer={props.footer}
            badgeBackgroundColor={props.badgeBackgroundColor}
            poweredByTextColor={props.poweredByTextColor}
            botContainer={botContainer}
          />
        </div>
      </div>
    </>
  );
};
