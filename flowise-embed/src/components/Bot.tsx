import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageQuery, isStreamAvailableQuery, IncomingInput, getChatbotConfig } from '@/queries/sendMessageQuery';
import { TextInput } from '@/components/inputs/textInput';
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
import { NewItemButton, SendButton } from '@/components/buttons/SendButton';
import { CircleDotIcon, TrashIcon } from '@/components/icons';
import { CancelButton } from '@/components/buttons/CancelButton';
import { cancelAudioRecording, startAudioRecording, stopAudioRecording } from '@/utils/audioRecording';
import { LeadCaptureBubble } from '@/components/bubbles/LeadCaptureBubble';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow } from '@/utils';
import { UploadButton } from '@/components/buttons/UploadButton';
import { messageUtils } from '@/utils/messageUtils';
import { FileUploadModal } from '@/features/modal/FileUploadModal';
import { UploadFile } from '@solid-primitives/upload';
import { NextChecklistButton } from '@/components/buttons/NextChecklistButton';
import { isImage } from '@/utils/isImage';
import { FileMapping } from '@/utils/fileUtils';
import { convertPdfToMultipleImages, pdfToText } from '@/utils/pdfUtils';
import {
  defaultChecklist,
  conferencesDefault,
  identifyDocumentChecklist,
  identifyDocumentType,
  DocumentTypes,
} from '@/utils/fileClassificationUtils';
import { customBooleanValues, sanitizeJson } from '@/utils/jsonUtils';
import CompareDocuments from '@/utils/compareDocuments';
import { checkImportLicenseDocuments } from '@/utils/complianceUtils';
import { colorTheme } from '@/utils/colorUtils';
import ParallelApiExecutor from '@/utils/parallelApiExecutor';
import { Flow } from '@/features/bubble/types';
import { locationValues, normalizeLocationNames, removeAccents } from '@/utils/locationUtils';
import { SelectionBubble } from './bubbles/SelectionBubble';

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

type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting' | 'leadCaptureMessage' | 'selectionMessage';

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
  flow: Flow;
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
const defaultBackgroundColor = '#ffffff';
const defaultTextColor = '#303235';

export const Bot = (botProps: BotProps & { class?: string }) => {
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
  const [ncmPhase, setNcmPhase] = createSignal(false);

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

  // audio recording
  const [elapsedTime, setElapsedTime] = createSignal('00:00');
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingNotSupported, setRecordingNotSupported] = createSignal(false);
  const [isLoadingRecording, setIsLoadingRecording] = createSignal(false);

  // drag & drop
  const [isDragActive, setIsDragActive] = createSignal(false);

  // document uploading
  const [startUploadingDocument, setStartUploadingDocument] = createSignal(true);
  const [documentsUploaded, setDocumentsUploaded] = createSignal(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  const [disableInput, setDisableInput] = createSignal(false);
  const [filesMapping, setFilesMapping] = createSignal<FileMapping[]>([]);
  const [currentChecklistNumber, setCurrentChecklistNumber] = createSignal<number>(0);
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = createSignal<boolean>(false);
  const [isNextChecklistButtonDisabled, setIsNextChecklistButtonDisabled] = createSignal<boolean>(false);

  onMount(() => {
    if (props.flow === Flow.CriticalAnalysis.toString()) {
      setMessages((prevMessages) => [...prevMessages, { message: messageUtils.CRITICAL_ANALYSIS_TEMPLATE, type: 'apiMessage' }]);
      setMessages((prevMessages) => [...prevMessages, { message: messageUtils.NCM_INICIAL_QUESTION, type: 'selectionMessage' }]);

      setDisableInput(false);
      setDocumentsUploaded(true);
    }
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
    resultText?: string,
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

  const promptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  createEffect(() => {
    const selectionMessage = messages().findLast((message) => message.type === 'selectionMessage')?.message;
    const userMessage = messages().findLast((message) => message.type === 'userMessage')?.message;

    if (
      selectionMessage === messageUtils.NCM_INICIAL_QUESTION ||
      selectionMessage === messageUtils.NCM_CONTINUE_QUESTION ||
      selectionMessage === messageUtils.NCM_HELP_QUESTION
    ) {
      if (userMessage === 'Sim') {
        setNcmPhase(true);
      } else if (userMessage === 'Não') {
        setNcmPhase(false);
      }
    }
  });

  const handleSubmit = async (inputValue: string, action?: IAction | null) => {
    try {
      setUserInput(inputValue);
      setLoading(true);
      scrollToBottom();
      clearPreviews();

      const fileUploads = getFileUploads();

      switch (props.flow) {
        case Flow.CriticalAnalysis.toString(): {
          if (ncmPhase()) {
            updateMessages(inputValue, fileUploads);
            const ncmDiscoverPrompt = `DESCOBRE_NCM\ntext:${inputValue}`;
            const ncmAnalysis = await sendBackgroundMessage(ncmDiscoverPrompt, fileUploads);
            setMessages((prevMessages) => [...prevMessages, { message: ncmAnalysis.text, type: 'apiMessage' }]);
            setMessages((prevMessages) => [...prevMessages, { message: messageUtils.NCM_CONTINUE_QUESTION, type: 'selectionMessage' }]);
          } else {
            updateMessages(inputValue, fileUploads);
            const promptInformMissingData = `CORRIGE_JSON\n${JSON.stringify(jsonResponseCriticalAnalysis())}\ntext:${inputValue}`;
            const jsonCriticalAnalysisUpdate = await sendBackgroundMessage(promptInformMissingData, fileUploads);
            await processCriticalAnalysisUpdate(jsonCriticalAnalysisUpdate);
          }
          break;
        }
        default: {
          updateMessages(inputValue, fileUploads);
          const body: IncomingInput = {
            question: inputValue,
            chatId: chatId(),
          };
          if (fileUploads && fileUploads.length > 0) body.uploads = fileUploads;
          if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;
          if (leadEmail()) body.leadEmail = leadEmail();
          if (action) body.action = action;
          if (isChatFlowAvailableToStream()) {
            body.socketIOClientId = socketIOClientId();
          } else {
            setUploading(false);
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
          }
          const result = await sendMessageQuery({
            chatflowid: props.chatflowid,
            apiHost: props.apiHost,
            body,
          });
          if (result.data) {
            const data = result.data;
            let text = '';
            if (data.text) text = data.text;
            else if (data.json) text = JSON.stringify(data.json, null, 2);
            else text = JSON.stringify(data, null, 2);
            updateLastMessage(text, data?.sourceDocuments, data?.fileAnnotations, data?.agentReasoning, data?.action, data.text);
          }
          if (result.error) {
            const error = result.error;
            console.error(error);
            let errorMessage = error.toString();
            if (typeof error === 'object') {
              errorMessage = `Error: ${error?.message.replaceAll('Error:', ' ')}`;
            }
            handleError(errorMessage);
            return;
          }
          break;
        }
      }

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
      const jsonDataCriticalAnalysis = JSON.parse(jsonCriticalAnalysisUpdate.text);

      for (const key in jsonDataCriticalAnalysis) {
        const normalizedKey = removeAccents(key);

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
        setLoading(false);
        setMessages((prevMessages) => [...prevMessages, { message: messageUtils.CRITICAL_ANALYSIS_MISSING_DATA, type: 'apiMessage' }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { message: messageUtils.CRITICAL_ANALYSIS_SUBMISSION_SUCCESS, type: 'apiMessage' }]);
        setLoading(true);
        setStartUploadingDocument(true);

        const parallelApiExecutor = new ParallelApiExecutor({
          jsonCriticalAnalysisUpdate,
          setMessages,
        });

        await parallelApiExecutor.execute();
        setLoading(false);
      }
      setMessages((prevMessages) => [...prevMessages, { message: messageUtils.NCM_HELP_QUESTION, type: 'selectionMessage' }]);

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

  const generateItemToPrint = (key: string, value: string, isChecklistItem = false) => {
    const spacedText = (text: string) => `<div style="padding-left: 20px; margin-bottom: 10px;">${text}</div>`;
    const hasValue = value !== 'null' && value !== null;
    const checkboxStyle = hasValue && !isChecklistItem ? 'color: white; background-color: #136FEE; ' : '';
    const readonlyAttribute = isChecklistItem ? '' : 'readonly onclick="return false;"';
    const noValueText = isChecklistItem ? 'N/A' : 'Valor não encontrado ou não preenchido.';

    let item = `<input type="checkbox" ${hasValue ? 'checked' : ''} ${readonlyAttribute} style="${checkboxStyle}"> <b>${key}</b>:<br>`;
    item += hasValue ? spacedText(value) : spacedText(noValueText);

    return item;
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
    } catch {
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

  const startProcessingFiles = async (files: UploadFile[]) => {
    if (props.flow !== Flow.CriticalAnalysis.toString()) {
      setIsUploadModalOpen(false);
      setDisableInput(true);
      setIsUploadButtonDisabled(true);
    }

    if (ncmPhase()) {
      setMessages((prevMessages) => [...prevMessages, { message: messageUtils.NCM_TEXT_INPUT_REQUIRED, type: 'apiMessage' }]);
      return;
    }
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
      } else {
        fileMap.type = DocumentTypes.DOCUMENTO_SEM_CHECKLIST;
        fileMap.checklist = defaultChecklist;
      }
      filesMap.push(fileMap);
    });

    setFilesMapping(filesMap);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: messageUtils.ALL_DOCUMENTS_VALIDATED_MESSAGE,
        type: 'apiMessage',
      },
    ]);

    // TODO: send alert message if needed
    switch (props.flow) {
      case Flow.CriticalAnalysis.toString():
        await processFileCriticalAnalysis();
        break;
      default:
        await processNextChecklist();
        setDocumentsUploaded(true);
        setIsUploadButtonDisabled(false);
    }
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

  const getTextContent = async (file: File) => {
    let textContent = '';
    try {
      textContent = await pdfToText(file);
      return textContent;
    } catch {
      return '';
    }
  };

  const processNextChecklist = async () => {
    setUploading(true);
    setLoading(true);

    const files = filesMapping();

    if (files.length === 0) {
      await executeComplianceCheck(filesMapping());
      return;
    }

    setIsNextChecklistButtonDisabled(true);

    const fileMap = files[currentChecklistNumber()];
    const file = fileMap.file;
    const urls = await processFileToSend(file.file);

    setCurrentChecklistNumber(currentChecklistNumber() + 1);

    setUploading(false);
    setMessages((prevMessages) => [...prevMessages, { message: `${file.name}`, type: 'userMessage', fileUploads: urls }]);

    const textContent = await getTextContent(file.file);

    const extractChecklist = async () => {
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const checklistPrompt = `CHECKLIST\n${fileMap.checklist}\n\nPlain-text: ${textContent}\n\njson: `;
          const resultFromBackgroundMessage = await sendBackgroundMessage(checklistPrompt, urls);
          let jsonData = JSON.parse(resultFromBackgroundMessage.text);
          jsonData = sanitizeJson(jsonData);

          if (Object.keys(jsonData).includes('error') && Object.keys(jsonData).length === 1) {
            throw new Error(jsonData.error);
          }

          fileMap.content = jsonData;
          fileMap.filledChecklist = jsonData;

          if (!Object.keys(jsonData).includes('checklist')) {
            throw new Error(messageUtils.CHECKLIST_NOT_FOUND_IN_RESPONSE_ERROR);
          }

          const generateChecklistItemToPrint = (key: string, value: any) => {
            if (value && typeof value === 'object') {
              const formatted_value = Object.entries(value)
                .map(([key, value]) => {
                  return `${key}: ${value}`;
                })
                .join('<br>');
              value = formatted_value;
            }

            const spacedText = (text: string) => `<div style="padding-left: 20px; margin-bottom: 10px;">${text}</div>`;
            const getMessage = (key: string, value: any, validValue: boolean, justificationNotFound: boolean) => {
              const isSuccessfulMessage = validValue && !justificationNotFound;
              if (isSuccessfulMessage) {
                return spacedText(value);
              } else {
                const defaultNotFoundMessage = justificationNotFound ? value : 'Não identificado';
                const signatureKey = 'Assinatura';
                const messageNotFoundSignature = 'A assinatura não foi identificada, por favor verifique manualmente!';
                const isSignatureKey = key === signatureKey;
                const message = isSignatureKey ? messageNotFoundSignature : defaultNotFoundMessage;

                return spacedText(`<span style="color: ${colorTheme.errorColor};">${message}</span>`);
              }
            };

            const isValidValue = value !== null && customBooleanValues.NOT_FOUND.toString() !== value;
            const hasJustificationNotFound = value && value.includes(customBooleanValues.FALSE_WITH_JUSTIFICATION.toString());
            const shouldCheckboxBeChecked = isValidValue && !hasJustificationNotFound;

            let checklistItem = `<input type="checkbox" ${shouldCheckboxBeChecked ? 'checked' : ''} disabled> <b>${key}</b>:<br>`;
            checklistItem += getMessage(key, value, isValidValue, hasJustificationNotFound);

            return checklistItem;
          };

          let checklistMessage = `<b>${fileMap.type}:</b><br>`;

          for (const [key, value] of Object.entries(jsonData.checklist)) {
            checklistMessage += generateChecklistItemToPrint(key, value);
          }

          if (Object.keys(jsonData).includes('conferências') && Object.keys(jsonData['conferências']).length > 0) {
            checklistMessage += `<br><b>Conferências:</b><br>`;
            for (const [key, value] of Object.entries(jsonData['conferências'])) {
              checklistMessage += generateChecklistItemToPrint(key, value);
            }
          }

          setMessages((prevMessages) => [...prevMessages, { message: checklistMessage, type: 'apiMessage' }]);

          const conferences = jsonData['conferências'];

          if (
            conferences &&
            ((Object.keys(conferences).includes('Máquina/Equipamento') && conferences['Máquina/Equipamento'] === 'true') ||
              (Object.keys(conferences).includes('Possui Ex-tarifário') && conferences['Possui Ex-tarifário'] === 'true'))
          ) {
            setMessages((prevMessages) => [...prevMessages, { message: messageUtils.EX_TARIFF_CHECK_ALERT_MESSAGE, type: 'apiMessage' }]);
          }

          if (!isChatFlowAvailableToStream()) {
            updateLastMessage(
              checklistMessage,
              resultFromBackgroundMessage?.sourceDocuments,
              resultFromBackgroundMessage?.fileAnnotations,
              resultFromBackgroundMessage?.agentReasoning,
              resultFromBackgroundMessage?.action,
              checklistMessage,
            );
          } else {
            updateLastMessage(
              '',
              resultFromBackgroundMessage?.sourceDocuments,
              resultFromBackgroundMessage?.fileAnnotations,
              resultFromBackgroundMessage?.agentReasoning,
              resultFromBackgroundMessage?.action,
              checklistMessage,
            );
          }
          break;
        } catch (error) {
          console.error(error);
          if (attempt === maxAttempts) {
            const errorMessage = messageUtils.UNABLE_TO_PROCESS_CHECKLIST_MESSAGE;

            setMessages((prevMessages) => [...prevMessages, { message: errorMessage, type: 'apiMessage' }]);
          }
        }
      }

      setIsNextChecklistButtonDisabled(false);
      setLoading(false);
    };
    await extractChecklist();
    try {
      setLoading(true);

      if (currentChecklistNumber() === files.length) {
        await executeComplianceCheck(filesMapping());
      }
    } catch (error) {
      console.error(error);
      const errorMessage = messageUtils.UNABLE_TO_PROCESS_CROSS_VALIDATION_MESSAGE;

      setMessages((prevMessages) => [...prevMessages, { message: errorMessage, type: 'apiMessage' }]);
    } finally {
      setLoading(false);
    }
  };

  const executeComplianceCheck = async (filledChecklists: FileMapping[]) => {
    if (!checkImportLicenseDocuments(filledChecklists)) {
      setMessages((prevMessages) => [...prevMessages, { message: messageUtils.IMPORT_LICENSE_NOT_FOUND_ALERT_MESSAGE, type: 'apiMessage' }]);
    }

    const compareDocuments = new CompareDocuments({
      fileMappings: filledChecklists,
      sendBackgroundMessage,
      setMessages,
    });
    const lastMessage = await compareDocuments.execute();

    if (lastMessage) {
      updateLastMessage(
        '',
        lastMessage?.sourceDocuments,
        lastMessage?.fileAnnotations,
        lastMessage?.agentReasoning,
        lastMessage?.action,
        lastMessage.text,
      );
    }
  };

  const processFileCriticalAnalysis = async () => {
    setLoading(true);
    const files = filesMapping().filter((item) => !!item);
    const fileMap = files[currentChecklistNumber()];
    const file = fileMap.file;
    const urls = await processFileToSend(file.file);

    setMessages((prevMessages) => [...prevMessages, { message: `${file.name}`, type: 'userMessage', fileUploads: urls as Partial<FileUpload>[] }]);

    const promptCriticalAnalysis = `VERIFICAR DADOS ANALISE CRITICA`;
    const dataFoundCriticalAnalysis = await sendBackgroundMessage(promptCriticalAnalysis, urls as any[]);

    await processCriticalAnalysisUpdate(dataFoundCriticalAnalysis);

    scrollToBottom();
  };

  return (
    <>
      <div
        ref={botContainer}
        class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}
      >
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
              'padding-left': '2rem',
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
                on:click={() => {
                  clearChat();
                  window.location.reload();
                }}
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
                    {message.type === 'selectionMessage' && (
                      <SelectionBubble
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
                        setMessages={setMessages}
                        handleSubmit={handleSubmit}
                        clearChat={clearChat}
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
                    {message.type === 'userMessage' && loading() && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading={uploading() ? 'upload' : 'typing'} />
                    )}
                    {message.type === 'apiMessage' && loading() && index() === messages().length - 1 && (
                      <LoadingBubble typeLoading={uploading() ? 'upload' : 'typing'} />
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
              filesMapping().filter((item) => !!item.checklist).length > currentChecklistNumber() && (
                <NextChecklistButton
                  onClick={() => processNextChecklist()}
                  text={messageUtils.NEXT_CHECKLIST_BUTTON_LABEL}
                  checklistNumber={filesMapping().filter((item) => !!item.checklist).length}
                  currentChecklistNumber={currentChecklistNumber()}
                  isDisabled={isNextChecklistButtonDisabled()}
                />
              )}

            {(startUploadingDocument() && documentsUploaded()) || !startUploadingDocument() ? (
              isRecording() ? (
                <>
                  {recordingNotSupported() ? (
                    <div class="w-full flex items-center justify-between p-4 border border-[#eeeeee]">
                      <div class="w-full flex items-center justify-between gap-3">
                        <span class="text-base">To record audio, use modern browsers like Chrome or Firefox that support audio recording.</span>
                        <button
                          class="py-2 px-4 justify-center flex items-center bg-red-500 text-white rounded-md"
                          type="button"
                          onClick={() => onRecordingCancelled()}
                        >
                          Okay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      class="h-[58px] flex items-center justify-between chatbot-input border border-[#eeeeee]"
                      data-testid="input"
                      style={{
                        margin: 'auto',
                        'background-color': props.textInput?.backgroundColor ?? defaultBackgroundColor,
                        color: props.textInput?.textColor ?? defaultTextColor,
                      }}
                    >
                      <div class="flex items-center gap-3 px-4 py-2">
                        <span>
                          <CircleDotIcon color="red" />
                        </span>
                        <span>{elapsedTime() || '00:00'}</span>
                        {isLoadingRecording() && <span class="ml-1.5">Sending...</span>}
                      </div>
                      <div class="flex items-center">
                        <CancelButton buttonColor={props.textInput?.sendButtonColor} type="button" class="m-0" on:click={onRecordingCancelled}>
                          <span style={{ 'font-family': 'Poppins, sans-serif' }}>Send</span>
                        </CancelButton>
                        <SendButton
                          sendButtonColor={props.textInput?.sendButtonColor}
                          type="button"
                          isDisabled={loading()}
                          class="m-0"
                          on:click={onRecordingStopped}
                        >
                          <span style={{ 'font-family': 'Poppins, sans-serif' }}>Send</span>
                        </SendButton>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <TextInput
                  backgroundColor={props.textInput?.backgroundColor}
                  textColor={props.textInput?.textColor}
                  placeholder={props.textInput?.placeholder}
                  sendButtonColor={props.textInput?.sendButtonColor}
                  maxChars={props.textInput?.maxChars}
                  maxCharsWarningMessage={props.textInput?.maxCharsWarningMessage}
                  autoFocus={props.textInput?.autoFocus}
                  fontSize={props.fontSize}
                  disabled={getInputDisabled() || disableInput()}
                  defaultValue={userInput()}
                  onSubmit={handleSubmit}
                  uploadsConfig={uploadsConfig()}
                  setPreviews={setPreviews}
                  onMicrophoneClicked={onMicrophoneClicked}
                  handleFileChange={handleFileChange}
                  sendMessageSound={props.textInput?.sendMessageSound}
                  sendSoundLocation={props.textInput?.sendSoundLocation}
                  startProcessingFiles={startProcessingFiles}
                />
              )
            ) : (
              <>
                {props.flow !== Flow.CriticalAnalysis.toString() ? (
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
                ) : null}
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
