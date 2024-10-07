import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageQuery, isStreamAvailableQuery, IncomingInput, getChatbotConfig } from '@/queries/sendMessageQuery';
import { TextInput } from '@/components/inputs/textInputCriticalAnalysis';
import { GuestBubble } from '@/components/bubbles/GuestBubble';
import { BotBubble } from '@/components/bubbles/BotBubble';
import { LoadingBubble } from '@/components/bubbles/LoadingBubble';
import { SourceBubble } from '@/components/bubbles/SourceBubble';
import { StarterPromptBubble } from '@/components/bubbles/StarterPromptBubble';
import { BotMessageTheme, FooterTheme, TextInputTheme, UserMessageTheme, FeedbackTheme } from '@/features/bubble/types';
import { Badge } from '@/components/Badge';
import socketIOClient from 'socket.io-client';
import { Popup } from '@/features/popup';
import { Avatar } from '@/components/avatars/Avatar';
import { NewItemButton } from '@/components/buttons/SendButton';
import { TrashIcon } from '@/components/icons';
import { LeadCaptureBubble } from '@/components/bubbles/LeadCaptureBubble';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { UploadButton } from '@/components/buttons/UploadButton';
import { messageUtils } from '@/utils/messageUtils';
import { FileUploadModal } from '@/features/modal/FileUploadModal';
import { UploadFile } from '@solid-primitives/upload';
import { isImage } from '@/utils/isImage';
import { FileMapping } from '@/utils/fileUtils';
import { convertPdfToMultipleImages } from '@/utils/pdfUtils';
import { conferencesDefault, identifyDocumentChecklist, identifyDocumentType } from '@/utils/fileClassificationUtils';
import ParallelApiExecutor from '@/utils/parallelApiExecutor';
import { locationValues, normalizeLocationNames } from '@/utils/locationUtils';

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
  const [jsonResponseCriticalAnalysis, setJsonResponseCriticalAnalysis] = createSignal({});
  const [loading, setLoading] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
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

  // drag & drop file input
  // TODO: fix this type
  const [previews, setPreviews] = createSignal<FilePreview[]>([]);

  // drag & drop
  // const [isDragActive, setIsDragActive] = createSignal(false);

  // document uploading
  const [startUploadingDocument, setStartUploadingDocument] = createSignal(true);
  const [documentsUploaded, setDocumentsUploaded] = createSignal(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  const [disableInput, setDisableInput] = createSignal(false);
  const [filesMapping, setFilesMapping] = createSignal<FileMapping[]>([]);
  const [currentChecklistNumber, setCurrentChecklistNumber] = createSignal<number>(0);
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
  const updateLastMessage = (text: string, sourceDocuments: any, fileAnnotations: any, agentReasoning: IAgentReasoning[] = [], action: IAction) => {
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

    if (startUploadingDocument()) {
      setDocumentsUploaded(false);
      setCurrentChecklistNumber(0);
      setFilesMapping([]);
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

  const handleDeletePreview = (itemToDelete: FilePreview) => {
    if (itemToDelete.type === 'file') {
      URL.revokeObjectURL(itemToDelete.preview); // Clean up for file
    }
    setPreviews(previews().filter((item) => item !== itemToDelete));
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

  const readImagesUrls = (imagesToUpload: any[]) => {
    // Logic from handleSubmit function
    const urls = imagesToUpload.map((item, index) => {
      return {
        data: item.data,
        type: item.type,
        name: item.name.split('.')[0] + index + '.' + item.name.split('.')[1],
        mime: item.mime,
      };
    });
    return urls;
  };

  const setImagesToBeUploaded = async (images: File[]): Promise<FilePreview[]> => {
    // Logic from handleFileChange function
    const filesList = [];
    for (const file of images) {
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

    return newFiles as FilePreview[];
  };

  const sendBackgroundMessage = async (value: string, urls: any[]) => {
    const body: IncomingInput = {
      question: value,
      chatId: chatId(),
    };

    if (urls && urls.length > 0) body.uploads = urls;

    if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

    const result = await sendMessageQuery({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      body,
    });

    if (result.data) {
      const data = result.data;

      return data;
    }
    if (result.error) {
      const error = result.error;
      console.error(error);
      return;
    }
  };

  const promptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const handleSubmit = async (inputValue: string, action?: IAction | null) => {
    try {
      setUserInput(inputValue);
      const promptInformMissingData = `CORRIGI_JSON\n${JSON.stringify(jsonResponseCriticalAnalysis())}\ntext:${inputValue}`;

      setLoading(true);
      scrollToBottom();
      clearPreviews();

      const fileUploads = getFileUploads();
      const jsonCriticalAnalysisUpdate = await sendBackgroundMessage(promptInformMissingData, fileUploads);

      updateMessages(inputValue, fileUploads);
      await processCriticalAnalysisUpdate(jsonCriticalAnalysisUpdate);

      setLoading(false);
      setUserInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      handleError();
    }
  };

  const getFileUploads = () => {
    return previews().map((item) => ({
      data: item.data,
      type: item.type,
      name: item.name,
      mime: item.mime,
    }));
  };

  const updateMessages = (inputValue: string, fileUploads: any[]) => {
    setMessages((prevMessages) => {
      const newMessages: MessageType[] = [...prevMessages, { message: inputValue, type: 'userMessage', fileUploads }];
      addChatMessage(newMessages);
      return newMessages;
    });
  };

  const processCriticalAnalysisUpdate = async (jsonCriticalAnalysisUpdate: any) => {
    try {
      console.log('jsonCriticalAnalysisUpdate:', jsonCriticalAnalysisUpdate);

      const jsonDataCriticalAnalysis = JSON.parse(jsonCriticalAnalysisUpdate.text);

      for (const key in jsonDataCriticalAnalysis) {
        const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (/estado/i.test(normalizedKey)) {
          jsonDataCriticalAnalysis[key] = normalizeLocationNames(jsonDataCriticalAnalysis[key], locationValues.STATE);
        }

        if (/pais/i.test(normalizedKey)) {
          jsonDataCriticalAnalysis[key] = normalizeLocationNames(jsonDataCriticalAnalysis[key], locationValues.COUNTRY);
        }
      }

      jsonCriticalAnalysisUpdate.text = JSON.stringify(jsonDataCriticalAnalysis);

      setJsonResponseCriticalAnalysis(jsonDataCriticalAnalysis);

      let criticalAnalysisMessage = `<b>Dados Necessários para Análise Crítica:</b><br>`;
      for (const [key, value] of Object.entries(jsonDataCriticalAnalysis)) {
        criticalAnalysisMessage += generateItemToPrint(key, value as string);
      }

      setMessages((prevMessages) => [...prevMessages, { message: criticalAnalysisMessage, type: 'apiMessage' }]);
      if (criticalAnalysisMessage.includes(messageUtils.DATA_NOT_FOUND)) {
        setDisableInput(false);
        setMessages((prevMessages) => [...prevMessages, { message: messageUtils.CRITICAL_ANALYSIS_MISSING_DATA, type: 'apiMessage' }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { message: messageUtils.CRITICAL_ANALYSIS_SUBMISSION_SUCCESS, type: 'apiMessage' }]);
        setLoading(true);

        const parallelApiExecutor = new ParallelApiExecutor({
          jsonCriticalAnalysisUpdate,
          setMessages,
        });

        await parallelApiExecutor.execute();

        setLoading(false);
      }

      if (!isChatFlowAvailableToStream()) {
        updateLastMessage(
          criticalAnalysisMessage,
          jsonCriticalAnalysisUpdate?.sourceDocuments,
          jsonCriticalAnalysisUpdate?.fileAnnotations,
          jsonCriticalAnalysisUpdate?.agentReasoning,
          jsonCriticalAnalysisUpdate?.action,
        );
      } else {
        updateLastMessage(
          '',
          jsonCriticalAnalysisUpdate?.sourceDocuments,
          jsonCriticalAnalysisUpdate?.fileAnnotations,
          jsonCriticalAnalysisUpdate?.agentReasoning,
          jsonCriticalAnalysisUpdate?.action,
        );
      }
    } catch (error) {
      console.error(messageUtils.CRITICAL_ANALYSIS_PROCESSING_ERROR, error);
      throw error;
    }
  };

  const generateItemToPrint = (key: string, value: string) => {
    const spacedText = (text: string) => `<div style="padding-left: 20px; margin-bottom: 10px;">${text}</div>`;
    const hasValue = value !== 'null' && value !== null;
    const checkboxStyle = hasValue ? 'color: white; background-color: background: #136FEE; ' : '';

    let criticalAnalysisItem = `<input type="checkbox" ${
      hasValue ? 'checked' : ''
    } readonly onclick="return false;" style="${checkboxStyle}"> <b>${key}</b>:<br>`;
    criticalAnalysisItem += hasValue ? spacedText(value) : spacedText(`Valor não encontrado ou não preenchido.`);
    return criticalAnalysisItem;
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

  const startProcessingFiles = async (files: UploadFile[]) => {
    setIsUploadModalOpen(false);
    setDisableInput(true);
    setIsUploadButtonDisabled(true);

    const filesMap: FileMapping[] = [];

    files.forEach((file) => {
      const fileMap = {
        file: file,
      } as FileMapping;
      const docType = identifyDocumentType(fileMap.file.file.name);
      if (docType) {
        fileMap.type = docType;
        const checklist = identifyDocumentChecklist(docType);
        if (checklist) {
          fileMap.checklist = checklist.concat(conferencesDefault);
        }
      }
      filesMap.push(fileMap);
    });

    setFilesMapping(filesMap);

    await processFileCriticalAnalysis();

    setDocumentsUploaded(true);
    setIsUploadButtonDisabled(false);
  };

  const processFileToSend = async (file: File) => {
    let imagesList: File[] = [];

    if (isImage(file.name)) {
      imagesList.push(file);
    } else {
      const pdfImages = await convertPdfToMultipleImages(file);
      imagesList = [...imagesList, ...pdfImages];
    }

    const imagesToUpload = await setImagesToBeUploaded(imagesList);
    const urls = readImagesUrls(imagesToUpload);
    return urls;
  };

  const processFileCriticalAnalysis = async () => {
    setUploading(true);
    setLoading(true);
    const files = filesMapping().filter((item) => !!item);
    const fileMap = files[currentChecklistNumber()];
    const file = fileMap.file;
    const urls = await processFileToSend(file.file);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setUploading(false);
    setMessages((prevMessages) => [...prevMessages, { message: `${file.name}`, type: 'userMessage', fileUploads: urls }]);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    // const promptCriticalAnalysis = `VERIFICAR DADOS ANALISE CRITICA`;
    // const dataFoundCriticalAnalysis = await sendBackgroundMessage(promptCriticalAnalysis, urls);
    const dataFoundCriticalAnalysis = {
      text: '{"NCM":null,"INCOTERM":null,"Local_INCOTERM":null,"Peso_bruto_estimado":null,"M3_estimada_quantidade_volumes_dimensoes":"30.00 CBM","País_origem_fabricação":"África do Sul","País_embarque":"Brasil","Estado_Importador":"SC"}',
      question: 'VERIFICAR DADOS ANALISE CRITICA',
      chatId: '7fbad502-89f3-4c27-aeee-3c632a9a3546',
      chatMessageId: '77ff99ad-4d42-4d13-bb49-07757b67b253',
      sessionId: '7fbad502-89f3-4c27-aeee-3c632a9a3546',
      agentReasoning: [
        {
          agentName: 'step-identification',
          messages: ['critical-analysis'],
          nodeName: 'seqCondition',
          nodeId: 'seqCondition_0',
        },
        {
          agentName: 'critical-analysis',
          messages: [
            '{"NCM":null,"INCOTERM":null,"Local_INCOTERM":null,"Peso_bruto_estimado":null,"M3_estimada_quantidade_volumes_dimensoes":"30.00 CBM","País_origem_fabricação":"África do Sul","País_embarque":"Brasil","Estado_Importador":"SC"}',
          ],
          usedTools: [null],
          sourceDocuments: [null],
          artifacts: [null],
          state: {},
          nodeName: 'seqAgent',
          nodeId: 'seqAgent_4',
        },
      ],
    };
    console.log('dataFoundCriticalAnalysis', dataFoundCriticalAnalysis);

    await processCriticalAnalysisUpdate(dataFoundCriticalAnalysis);

    setLoading(false);
    setUserInput('');
    scrollToBottom();
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
                        showAgentMessages={false}
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
                    {message.type === 'userMessage' && loading() && uploading() && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading="upload" />
                    )}
                    {message.type === 'apiMessage' && loading() && uploading() && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading="upload" />
                    )}
                    {message.type === 'userMessage' && loading() && uploading() === false && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading="typing" />
                    )}
                    {message.type === 'apiMessage' && loading() && uploading() === false && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading="typing" />
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
            {startUploadingDocument() &&
              documentsUploaded() &&
              disableInput() &&
              filesMapping().filter((item) => !!item.checklist).length > 1 &&
              filesMapping().filter((item) => !!item.checklist).length > currentChecklistNumber()}
            {(startUploadingDocument() && documentsUploaded()) || !startUploadingDocument() ? (
              <TextInput
                backgroundColor={props.textInput?.backgroundColor}
                textColor={props.textInput?.textColor}
                placeholder={props.textInput?.placeholder}
                sendButtonColor={props.textInput?.sendButtonColor}
                maxChars={props.textInput?.maxChars}
                autoFocus={props.textInput?.autoFocus}
                fontSize={props.fontSize}
                disabled={getInputDisabled() || disableInput()}
                defaultValue={userInput()}
                onSubmit={handleSubmit}
                uploadsConfig={uploadsConfig()}
                setPreviews={setPreviews}
                handleFileChange={handleFileChange}
                sendSoundLocation={props.textInput?.sendSoundLocation}
              />
            ) : (
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
    </>
  );
};
