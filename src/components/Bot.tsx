import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageQuery, isStreamAvailableQuery, IncomingInput, getChatbotConfig } from '@/queries/sendMessageQuery';
import { GuestBubble, BotBubble, LoadingBubble, SourceBubble, StarterPromptBubble } from '@/components/bubbles';
import {
  BotMessageTheme,
  FooterTheme,
  TextInputTheme,
  UserMessageTheme,
  FeedbackTheme,
  ButtonInputTheme,
  TextExtractionConfig,
} from '@/features/bubble/types';
import { Badge } from '@/components/Badge';
import socketIOClient from 'socket.io-client';
import { Popup } from '@/features/popup';
import { Avatar } from '@/components/avatars/Avatar';
import { DeleteButton } from '@/components/buttons/SendButton';
import { TrashIcon } from '@/components/icons';
import { cancelAudioRecording, startAudioRecording, stopAudioRecording } from '@/utils/audioRecording';
import { LeadCaptureBubble } from '@/components/bubbles';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { UploadButton } from '@/components/buttons/UploadButton';
import { FileUploadModal } from '@/features/modal';
import { UploadFile } from '@solid-primitives/upload';
import { sendFileToTextExtraction } from '@/queries/sendFileToExtract';
import { isImage } from '@/utils/isImage';
import { TextInput } from '@/components/inputs/textInput';
import { messageUtils } from '@/utils/messageUtils';

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

type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting' | 'leadCaptureMessage' | 'userFile';

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

export type BotProps = {
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
  buttonInput?: ButtonInputTheme;
  fileTextExtractionUrl: TextExtractionConfig;
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

export const Bot = (botProps: BotProps & { class?: string }) => {
  // set a default value for showTitle if not set and merge with other props
  const props = mergeProps({ showTitle: true }, botProps);
  let chatContainer: HTMLDivElement | undefined;
  let bottomSpacer: HTMLDivElement | undefined;
  let botContainer: HTMLDivElement | undefined;

  const [userInput, setUserInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [modalOpen, setModalOpen] = createSignal(false);
  const [sourcePopupOpen, setSourcePopupOpen] = createSignal(false);
  const [sourcePopupSrc, setSourcePopupSrc] = createSignal({});
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
  const [starterPrompts, setStarterPrompts] = createSignal<string[]>([], { equals: false });
  const [chatFeedbackStatus, setChatFeedbackStatus] = createSignal<boolean>(false);
  const [uploadsConfig, setUploadsConfig] = createSignal<UploadsConfig>();
  const [leadsConfig, setLeadsConfig] = createSignal<LeadsConfig>();
  const [isLeadSaved, setIsLeadSaved] = createSignal(false);
  const [leadEmail, setLeadEmail] = createSignal('');
  const [filesSent, setFilesSent] = createSignal(false);
  const [fileText, setFileText] = createSignal<string>();

  // drag & drop file input
  // TODO: fix this type
  const [previews, setPreviews] = createSignal<FilePreview[]>([]);

  // audio recording
  const [elapsedTime, setElapsedTime] = createSignal('00:00');
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingNotSupported, setRecordingNotSupported] = createSignal(false);
  const [isLoadingRecording, setIsLoadingRecording] = createSignal(false);

  // drag & drop
  const [isDragActive, setIsDragActive] = createSignal(false);

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

  const onUploadFormSubmit = async (files: UploadFile[]) => {
    setFilesSent(true);
    setLoading(true);
    setModalOpen(false);
    files.forEach((file) => {
      setMessages((prevMessages) => [...prevMessages, { message: `Título do documento: ${file.name} Tamanho: ${file.size}`, type: 'userMessage' }]);
    });

    const { text } = await sendFileToTextExtraction({
      extractUrl: isImage(files[0].name) ? props.fileTextExtractionUrl.image : props.fileTextExtractionUrl.default,
      body: { files: files[0] },
    });
    if (!text) return;
    setFileText(text);
  };

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

  // Define the audioRef
  let audioRef: HTMLAudioElement | undefined;
  // CDN link for default receive sound
  const defaultReceiveSound = 'https://cdn.jsdelivr.net/gh/FlowiseAI/FlowiseChatEmbed@latest/src/assets/receive_message.mp3';
  const playReceiveSound = () => {
    if (props.textInput?.receiveMessageSound) {
      let audioSrc = defaultReceiveSound;
      if (props.textInput?.receiveSoundLocation) {
        audioSrc = props.textInput?.receiveSoundLocation;
      }
      audioRef = new Audio(audioSrc);
      audioRef.play();
    }
  };

  let hasSoundPlayed = false;
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
          if (resultText && !hasSoundPlayed) {
            playReceiveSound();
            hasSoundPlayed = true;
          }
          return { ...item, message: item.message + text, sourceDocuments, fileAnnotations, agentReasoning, action };
        }
        return item;
      });
      addChatMessage(updated);
      return [...updated];
    });

    // Set hasSoundPlayed to false if resultText exists
    if (resultText) {
      hasSoundPlayed = false;
    }
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

  const openModal = () => {
    setModalOpen(true);
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

  const promptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const handleActionClick = async (label: string) => {
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
    handleSubmit(label);
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

  createEffect(() => {
    if (props.starterPrompts && props.starterPrompts.length > 0) {
      const prompts = Object.values(props.starterPrompts).map((prompt) => prompt);

      return setStarterPrompts(prompts.filter((prompt) => prompt !== ''));
    }
  });

  // Auto scroll chat to bottom
  createEffect(() => {
    if (messages()) {
      if (messages().length > 1) {
        setTimeout(() => {
          chatContainer?.scrollTo(0, chatContainer.scrollHeight);
        }, 400);
      }
    }
  });

  createEffect(() => {
    if (props.fontSize && botContainer) botContainer.style.fontSize = `${props.fontSize}px`;
  });

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
      if ((!props.starterPrompts || props.starterPrompts?.length === 0) && chatbotConfig.starterPrompts) {
        const prompts: string[] = [];
        Object.getOwnPropertyNames(chatbotConfig.starterPrompts).forEach((key) => {
          prompts.push(chatbotConfig.starterPrompts[key].prompt);
        });
        setStarterPrompts(prompts.filter((prompt) => prompt !== ''));
      }
      if (chatbotConfig.chatFeedback) {
        const chatFeedbackStatus = chatbotConfig.chatFeedback.status;
        setChatFeedbackStatus(chatFeedbackStatus);
      }
      if (chatbotConfig.uploads) {
        setUploadsConfig(chatbotConfig.uploads);
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

  const addRecordingToPreviews = (blob: Blob) => {
    let mimeType = '';
    const pos = blob.type.indexOf(';');
    if (pos === -1) {
      mimeType = blob.type;
    } else {
      mimeType = blob.type.substring(0, pos);
    }

    // read blob and add to previews
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as FilePreviewData;
      const upload: FilePreview = {
        data: base64data,
        preview: '../assets/wave-sound.jpg',
        type: 'audio',
        name: `audio_${Date.now()}.wav`,
        mime: mimeType,
      };
      setPreviews((prevPreviews) => [...prevPreviews, upload]);
    };
  };

  const isFileAllowedForUpload = (file: File) => {
    let acceptFile = false;
    if (uploadsConfig() && uploadsConfig()?.isImageUploadAllowed && uploadsConfig()?.imgUploadSizeAndTypes) {
      const fileType = file.type;
      const sizeInMB = file.size / 1024 / 1024;
      uploadsConfig()?.imgUploadSizeAndTypes.map((allowed) => {
        if (allowed.fileTypes.includes(fileType) && sizeInMB <= allowed.maxUploadSize) {
          acceptFile = true;
        }
      });
    }
    if (!acceptFile) {
      alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
    }
    return acceptFile;
  };

  const handleFileChange = async (event: FileEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const filesList = [];
    for (const file of files) {
      if (isFileAllowedForUpload(file) === false) {
        return;
      }
      const reader = new FileReader();
      const { name } = file;
      filesList.push(
        new Promise((resolve) => {
          reader.onload = (evt) => {
            if (!evt?.target?.result) {
              return;
            }
            const { result } = evt.target;
            resolve({
              data: result,
              preview: URL.createObjectURL(file),
              type: 'file',
              name: name,
              mime: file.type,
            });
          };
          reader.readAsDataURL(file);
        }),
      );
    }

    const newFiles = await Promise.all(filesList);
    setPreviews((prevPreviews) => [...prevPreviews, ...(newFiles as FilePreview[])]);
  };

  const handleDrag = (e: DragEvent) => {
    if (uploadsConfig()?.isImageUploadAllowed) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragActive(true);
      } else if (e.type === 'dragleave') {
        setIsDragActive(false);
      }
    }
  };

  const handleDrop = async (e: InputEvent | DragEvent) => {
    if (!uploadsConfig()?.isImageUploadAllowed) {
      return;
    }
    e.preventDefault();
    setIsDragActive(false);
    const files = [];
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      for (const file of e.dataTransfer.files) {
        if (isFileAllowedForUpload(file) === false) {
          return;
        }
        const reader = new FileReader();
        const { name } = file;
        files.push(
          new Promise((resolve) => {
            reader.onload = (evt) => {
              if (!evt?.target?.result) {
                return;
              }
              const { result } = evt.target;
              let previewUrl;
              if (file.type.startsWith('audio/')) {
                previewUrl = '../assets/wave-sound.jpg';
              } else if (file.type.startsWith('image/')) {
                previewUrl = URL.createObjectURL(file);
              }
              resolve({
                data: result,
                preview: previewUrl,
                type: 'file',
                name: name,
                mime: file.type,
              });
            };
            reader.readAsDataURL(file);
          }),
        );
      }

      const newFiles = await Promise.all(files);
      setPreviews((prevPreviews) => [...prevPreviews, ...(newFiles as FilePreview[])]);
    }

    if (e.dataTransfer && e.dataTransfer.items) {
      for (const item of e.dataTransfer.items) {
        if (item.kind === 'string' && item.type.match('^text/uri-list')) {
          item.getAsString((s: string) => {
            const upload: FilePreview = {
              data: s,
              preview: s,
              type: 'url',
              name: s.substring(s.lastIndexOf('/') + 1),
              mime: '',
            };
            setPreviews((prevPreviews) => [...prevPreviews, upload]);
          });
        } else if (item.kind === 'string' && item.type.match('^text/html')) {
          item.getAsString((s: string) => {
            if (s.indexOf('href') === -1) return;
            //extract href
            const start = s.substring(s.indexOf('href') + 6);
            const hrefStr = start.substring(0, start.indexOf('"'));

            const upload: FilePreview = {
              data: hrefStr,
              preview: hrefStr,
              type: 'url',
              name: hrefStr.substring(hrefStr.lastIndexOf('/') + 1),
              mime: '',
            };
            setPreviews((prevPreviews) => [...prevPreviews, upload]);
          });
        }
      }
    }
  };

  const handleDeletePreview = (itemToDelete: FilePreview) => {
    if (itemToDelete.type === 'file') {
      URL.revokeObjectURL(itemToDelete.preview); // Clean up for file
    }
    setPreviews(previews().filter((item) => item !== itemToDelete));
  };

  const onMicrophoneClicked = () => {
    setIsRecording(true);
    startAudioRecording(setIsRecording, setRecordingNotSupported, setElapsedTime);
  };

  const onRecordingCancelled = () => {
    if (!recordingNotSupported) cancelAudioRecording();
    setIsRecording(false);
    setRecordingNotSupported(false);
  };

  const onRecordingStopped = async () => {
    setIsLoadingRecording(true);
    stopAudioRecording(addRecordingToPreviews);
  };

  const getInputDisabled = (): boolean => {
    const messagesArray = messages();
    const disabled =
      loading() ||
      !props.chatflowid ||
      (leadsConfig()?.status && !isLeadSaved()) ||
      (messagesArray[messagesArray.length - 1].action && Object.keys(messagesArray[messagesArray.length - 1].action as any).length > 0);
    if (disabled) {
      return true;
    }
    return false;
  };

  createEffect(
    // listen for changes in previews
    on(previews, (uploads) => {
      // wait for audio recording to load and then send
      const containsAudio = uploads.filter((item) => item.type === 'audio').length > 0;
      if (uploads.length >= 1 && containsAudio) {
        setIsRecording(false);
        setRecordingNotSupported(false);
        promptClick('');
      }

      return () => {
        setPreviews([]);
      };
    }),
  );

  const handleSubmit = async (value: string, hidden = false) => {
    if (value.trim() === '') {
      return;
    }

    setUserInput(value);
    setLoading(true);
    scrollToBottom();

    const welcomeMessage = props.welcomeMessage ?? defaultWelcomeMessage;
    const messageList = messages().filter((msg) => msg.message !== welcomeMessage);

    if (!hidden)
      setMessages((prevMessages) => {
        const messages: MessageType[] = [...prevMessages, { message: value, type: 'userMessage' }];
        return messages;
      });

    const body: IncomingInput = {
      question: value,
      history: messageList,
      overrideConfig: {
        text: fileText(),
      },
      chatId: chatId(),
    };

    if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

    if (isChatFlowAvailableToStream()) body.socketIOClientId = socketIOClientId();

    const result = await sendMessageQuery({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      body,
    });

    if (result.data) {
      const data = result.data;
      if (!isChatFlowAvailableToStream()) {
        let text = '';
        if (data.text) text = data.text;
        else if (data.json) text = JSON.stringify(data.json, null, 2);
        else text = JSON.stringify(data, null, 2);

        setMessages((prevMessages) => {
          const messages: MessageType[] = [
            ...prevMessages,
            { message: text, sourceDocuments: data?.sourceDocuments, fileAnnotations: data?.fileAnnotations, type: 'apiMessage' },
          ];
          return messages;
        });
      }
      setLoading(false);
      setUserInput('');
      scrollToBottom();
    }
    if (result.error) {
      const error = result.error;
      console.error(error);
      const err: any = error;
      const errorData = typeof err === 'string' ? err : err.response.data || `${err.response.status}: ${err.response.statusText}`;
      handleError(errorData);
      return;
    }
  };
  return (
    <>
      <div
        ref={botContainer}
        class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}
        onDragEnter={handleDrag}
      >
        {isDragActive() && (
          <div
            class="absolute top-0 left-0 bottom-0 right-0 w-full h-full z-50"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragEnd={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
        )}
        {isDragActive() && uploadsConfig()?.isImageUploadAllowed && (
          <div
            class="absolute top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white z-40 gap-2 border-2 border-dashed"
            style={{ 'border-color': props.bubbleBackgroundColor }}
          >
            <h2 class="text-xl font-semibold">Drop here to upload</h2>
            <For each={uploadsConfig()?.imgUploadSizeAndTypes}>
              {(allowed) => {
                return (
                  <>
                    <span>{allowed.fileTypes?.join(', ')}</span>
                    <span>Max Allowed Size: {allowed.maxUploadSize} MB</span>
                  </>
                );
              }}
            </For>
          </div>
        )}

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
            <DeleteButton
              sendButtonColor={props.bubbleTextColor}
              type="button"
              isDisabled={messages().length === 1}
              class="my-2 ml-2"
              on:click={clearChat}
            >
              <span style={{ 'font-family': 'Poppins, sans-serif' }}>Clear</span>
            </DeleteButton>
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
                        handleActionClick={(label) => handleActionClick(label)}
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
                    {message.type === 'userMessage' && loading() && index() === messages().length - 1 && <LoadingBubble />}
                    {message.type === 'apiMessage' && message.message === '' && loading() && index() === messages().length - 1 && <LoadingBubble />}
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
                                  if (URL) {
                                    window.open(src.metadata.source, '_blank');
                                  } else {
                                    setSourcePopupSrc(src);
                                    setSourcePopupOpen(true);
                                  }
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
          <Show when={messages().length === 1}>
            <Show when={starterPrompts().length > 0}>
              <div class="w-full flex flex-row flex-wrap px-5 py-[10px] gap-2">
                <For each={[...starterPrompts()]}>
                  {(key) => (
                    <StarterPromptBubble
                      prompt={key}
                      onPromptClick={() => promptClick(key)}
                      starterPromptFontSize={botProps.starterPromptFontSize} // Pass it here as a number
                    />
                  )}
                </For>
              </div>
            </Show>
          </Show>
          <Show when={previews().length > 0}>
            <div class="w-full flex items-center justify-start gap-2 px-5 pt-2 border-t border-[#eeeeee]">
              <For each={[...previews()]}>
                {(item) => (
                  <>
                    {item.mime.startsWith('image/') ? (
                      <button
                        class="group w-12 h-12 flex items-center justify-center relative rounded-[10px] overflow-hidden transition-colors duration-200"
                        onClick={() => handleDeletePreview(item)}
                      >
                        <img class="w-full h-full bg-cover" src={item.data as string} />
                        <span class="absolute hidden group-hover:flex items-center justify-center z-10 w-full h-full top-0 left-0 bg-black/10 rounded-[10px] transition-colors duration-200">
                          <TrashIcon />
                        </span>
                      </button>
                    ) : (
                      <div
                        class={`inline-flex basis-auto flex-grow-0 flex-shrink-0 justify-between items-center rounded-xl h-12 p-1 mr-1 bg-gray-500`}
                        style={{
                          width: `${
                            chatContainer ? (botProps.isFullPage ? chatContainer?.offsetWidth / 4 : chatContainer?.offsetWidth / 2) : '200'
                          }px`,
                        }}
                      >
                        <audio class="block bg-cover bg-center w-full h-full rounded-none text-transparent" controls src={item.data as string} />
                        <button class="w-7 h-7 flex items-center justify-center bg-transparent p-1" onClick={() => handleDeletePreview(item)}>
                          <TrashIcon color="white" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </For>
            </div>
          </Show>
          <div class="w-full px-5 pt-2 pb-1">
            {filesSent() ? (
              <TextInput
                backgroundColor={props.textInput?.backgroundColor}
                textColor={props.textInput?.textColor}
                placeholder={props.textInput?.placeholder}
                sendButtonColor={props.textInput?.sendButtonColor}
                maxChars={props.textInput?.maxChars}
                maxCharsWarningMessage={props.textInput?.maxCharsWarningMessage}
                autoFocus={props.textInput?.autoFocus}
                fontSize={props.fontSize}
                defaultValue={userInput()}
                onSubmit={handleSubmit}
                uploadsConfig={uploadsConfig()}
                setPreviews={setPreviews}
                onMicrophoneClicked={onMicrophoneClicked}
                handleFileChange={handleFileChange}
                sendMessageSound={props.textInput?.sendMessageSound}
                sendSoundLocation={props.textInput?.sendSoundLocation}
              />
            ) : (
              <UploadButton onClick={() => openModal()} text={messageUtils.UPLOAD_BUTTON_LABEL} />
            )}
          </div>
          <Badge
            footer={props.footer}
            badgeBackgroundColor={props.badgeBackgroundColor}
            poweredByTextColor={props.poweredByTextColor}
            botContainer={botContainer}
          />
        </div>
      </div>
      {sourcePopupOpen() && <Popup isOpen={sourcePopupOpen()} value={sourcePopupSrc()} onClose={() => setSourcePopupOpen(false)} />}
      {modalOpen() && (
        <FileUploadModal
          isOpen={modalOpen()}
          onClose={() => setModalOpen(false)}
          onUploadSubmit={onUploadFormSubmit}
          buttonInput={props.buttonInput}
          modalTitle={messageUtils.MODAL_TITLE}
          uploadLabel={messageUtils.UPLOADING_LABEL}
          uploadingButtonLabel={messageUtils.MODAL_BUTTON}
          errorMessage={messageUtils.FILE_TYPE_NOT_SUPPORTED}
        />
      )}
    </>
  );
};
