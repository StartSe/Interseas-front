import { createSignal, createEffect, For, onMount, Show, mergeProps, on, createMemo } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import {
  sendMessageQuery,
  upsertVectorStoreWithFormData,
  isStreamAvailableQuery,
  IncomingInput,
  getChatbotConfig,
  FeedbackRatingType,
  createAttachmentWithFormData,
} from '@/queries/sendMessageQuery';
import { TextInput } from './inputs/textInput';
import { GuestBubble } from './bubbles/GuestBubble';
import { BotBubble } from './bubbles/BotBubble';
import { LoadingBubble } from './bubbles/LoadingBubble';
import { SourceBubble } from './bubbles/SourceBubble';
import {
  BotMessageTheme,
  FooterTheme,
  TextInputTheme,
  UserMessageTheme,
  FeedbackTheme,
  DisclaimerPopUpTheme,
  DateTimeToggleTheme,
} from '@/features/bubble/types';
import { Badge } from './Badge';
import socketIOClient from 'socket.io-client';
import { Popup, DisclaimerPopup } from '@/features/popup';
import { Avatar } from '@/components/avatars/Avatar';
import { DeleteButton, SendButton } from '@/components/buttons/SendButton';
import { FilePreview } from '@/components/inputs/textInput/components/FilePreview';
import { CircleDotIcon, SparklesIcon, TrashIcon } from './icons';
import { CancelButton } from './buttons/CancelButton';
import { cancelAudioRecording, startAudioRecording, stopAudioRecording } from '@/utils/audioRecording';
import { LeadCaptureBubble } from '@/components/bubbles/LeadCaptureBubble';
import { removeLocalStorageChatHistory, getLocalStorageChatflow, setLocalStorageChatflow, setCookie, getCookie } from '@/utils';
import { cloneDeep } from 'lodash';
import { FollowUpPromptBubble } from '@/components/bubbles/FollowUpPromptBubble';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { UploadButton } from '@/components/buttons/UploadButton';
import {
  complianceErrorMessage,
  criticalAnalysisNcmErrorMessage,
  criticalAnalysisStepNameMapping,
  criticalAnalysisWarningMapping,
  messageUtils,
  ncmExistenceErrorMessage,
  ncmLengthErrorMessage,
  ncmStepFailureMessage,
  ncmSuccessValidation,
  ncmValidationErrorMessage,
} from '@/utils/messageUtils';
import { FileUploadModal } from '@/features/modal/FileUploadModal';
import { UploadFile } from '@solid-primitives/upload';
import { NextChecklistButton } from '@/components/buttons/NextChecklistButton';
import { isImage } from '@/utils/isImage';
import { DatabaseProvidedFile, FileMapping } from '@/utils/fileUtils';
import { convertPdfToMultipleImages, pdfToText } from '@/utils/pdfUtils';
import {
  defaultChecklist,
  conferencesDefault,
  identifyDocumentChecklist,
  identifyDocumentType,
  DocumentTypes,
  sortUploadFiles,
} from '@/utils/fileClassificationUtils';
import { compareAndMergeArrays, customBooleanValues, isNonEmptyArrayOrObject, sanitizeJson, sanitizeToFlatArray } from '@/utils/jsonUtils';
import CompareDocuments from '@/utils/compareDocuments';
import { colorTheme } from '@/utils/colorUtils';
import { CriticalAnalysisPrefixes, verifyNcmExistence } from '@/utils/criticalAnalysisUtils';
import { Flow } from '@/features/bubble/types';
import { locationValues, normalizeLocationNames, removeAccents } from '@/utils/locationUtils';
import DocumentsDBService from '@/service/documentsDBService';
import historyChatFlowiseAPI, { ChatMessage, ChatRole } from '@/service/historyChatFlowiseAPI';

export type FileEvent<T = EventTarget> = {
  target: T;
};

export type FormEvent<T = EventTarget> = {
  preventDefault: () => void;
  currentTarget: T;
};

type IUploadConstraits = {
  fileTypes: string[];
  maxUploadSize: number;
};

export type UploadsConfig = {
  imgUploadSizeAndTypes: IUploadConstraits[];
  fileUploadSizeAndTypes: IUploadConstraits[];
  isImageUploadAllowed: boolean;
  isSpeechToTextEnabled: boolean;
  isRAGFileUploadAllowed: boolean;
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
  artifacts?: FileUpload[];
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
  artifacts?: Partial<FileUpload>[];
  agentReasoning?: IAgentReasoning[];
  usedTools?: any[];
  action?: IAction | null;
  rating?: FeedbackRatingType;
  id?: string;
  followUpPrompts?: string;
  dateTime?: string;
  disabled?: boolean;
};

type IUploads = {
  data: FilePreviewData;
  type: string;
  name: string;
  mime: string;
}[];

type observerConfigType = (accessor: string | boolean | object | MessageType[]) => void;
export type observersConfigType = Record<'observeUserInput' | 'observeLoading' | 'observeMessages', observerConfigType>;

export type BotProps = {
  chatflowid: string;
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
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
  sourceDocsTitle?: string;
  observersConfig?: observersConfigType;
  starterPrompts?: string[] | Record<string, { prompt: string }>;
  starterPromptFontSize?: number;
  clearChatOnReload?: boolean;
  disclaimer?: DisclaimerPopUpTheme;
  dateTimeToggle?: DateTimeToggleTheme;
  renderHTML?: boolean;
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
const documentService = new DocumentsDBService();
const historyChatFlowiseApi = new historyChatFlowiseAPI();

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
  const [isMessageStopping, setIsMessageStopping] = createSignal(false);
  const [starterPrompts, setStarterPrompts] = createSignal<string[]>([], { equals: false });
  const [chatFeedbackStatus, setChatFeedbackStatus] = createSignal<boolean>(false);
  const [fullFileUpload, setFullFileUpload] = createSignal<boolean>(false);
  const [uploadsConfig, setUploadsConfig] = createSignal<UploadsConfig>();
  const [leadsConfig, setLeadsConfig] = createSignal<LeadsConfig>();
  const [isLeadSaved, setIsLeadSaved] = createSignal(false);
  const [leadEmail, setLeadEmail] = createSignal('');
  const [disclaimerPopupOpen, setDisclaimerPopupOpen] = createSignal(false);

  // drag & drop file input
  // TODO: fix this type
  const [previews, setPreviews] = createSignal<FilePreview[]>([]);

  // audio recording
  const [elapsedTime, setElapsedTime] = createSignal('00:00');
  const [isRecording, setIsRecording] = createSignal(false);
  const [recordingNotSupported, setRecordingNotSupported] = createSignal(false);
  const [isLoadingRecording, setIsLoadingRecording] = createSignal(false);

  // follow-up prompts
  const [followUpPromptsStatus, setFollowUpPromptsStatus] = createSignal<boolean>(false);
  const [followUpPrompts, setFollowUpPrompts] = createSignal<string[]>([]);

  // drag & drop
  const [isDragActive, setIsDragActive] = createSignal(false);
  const [uploadedFiles, setUploadedFiles] = createSignal<{ file: File; type: string }[]>([]);

  createMemo(() => {
    const customerId = (props.chatflowConfig?.vars as any)?.customerId;
    setChatId(customerId ? `${customerId.toString()}+${uuidv4()}` : uuidv4());
  });

  // document uploading
  const [startUploadingDocument, setStartUploadingDocument] = createSignal(true);
  const [documentsUploaded, setDocumentsUploaded] = createSignal(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  const [hiddenInput, setHiddenInput] = createSignal<boolean>(false);
  const [disableInput, setDisableInput] = createSignal(false);
  const [filesMapping, setFilesMapping] = createSignal<FileMapping[]>([]);
  const [currentChecklistNumber, setCurrentChecklistNumber] = createSignal<number>(0);
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = createSignal<boolean>(false);
  const [isNextChecklistButtonDisabled, setIsNextChecklistButtonDisabled] = createSignal<boolean>(false);
  const [documentsChecklistError, setDocumentsChecklistError] = createSignal<string[]>([]);
  const hsCodeRegex = /hs code/i;

  onMount(() => {
    if (props.flow === Flow.CriticalAnalysis.toString()) {
      setDisableInput(false);
      setDocumentsUploaded(true);
    }
    if (props.flow === Flow.taxClassification.toString()) {
      setDisableInput(false);
      setDocumentsUploaded(true);
    }
  });

  onMount(async () => {
    await fetchAndProcessChatHistory();
    const minimumMessages = 2;
    if (props.flow === Flow.CriticalAnalysis.toString() && messages().length < minimumMessages) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.CRITICAL_ANALYSIS_TEMPLATE, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
    }
    if (props.flow === Flow.taxClassification.toString() && messages().length < minimumMessages) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.NCM_DISCOVER_TEMPLATE, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
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
  const addChatMessage = async (allMessage: MessageType[]) => {
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
    const userMessageType = 'userMessage';
    const chatMessage = getLocalStorageChatflow(props.chatflowid);
    const hasUserMessage = chatMessage?.chatHistory?.some((message: MessageType) => message.type === userMessageType);

    if ((!chatMessage || Object.entries(chatMessage).length === 0 || !hasUserMessage) && messages[messages.length - 1].type === userMessageType) {
      const chatData = {
        id: chatId(),
        agent_flow: props.flow,
      };

      await documentService.saveChatData(chatData);
    }
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

  const updateLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      if (!text) return allMessages;
      allMessages[allMessages.length - 1].message += text;
      allMessages[allMessages.length - 1].rating = undefined;
      allMessages[allMessages.length - 1].dateTime = new Date().toISOString();
      if (!hasSoundPlayed) {
        playReceiveSound();
        hasSoundPlayed = true;
      }
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateErrorMessage = (errorMessage: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      allMessages.push({ message: props.errorMessage || errorMessage, type: 'apiMessage' });
      addChatMessage(allMessages);
      return allMessages;
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

  const updateLastMessageUsedTools = (usedTools: any[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].usedTools = usedTools;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageFileAnnotations = (fileAnnotations: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].fileAnnotations = fileAnnotations;
      addChatMessage(allMessages);
      return allMessages;
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

  const updateLastMessageArtifacts = (artifacts: FileUpload[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].artifacts = artifacts;
      addChatMessage(allMessages);
      return allMessages;
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
    setUploadedFiles([]);
    scrollToBottom();
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerPopupOpen(false); // Close the disclaimer popup
    setCookie('chatbotDisclaimer', 'true', 365); // Disclaimer accepted
  };

  const promptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const followUpPromptClick = (prompt: string) => {
    setFollowUpPrompts([]);
    handleSubmit(prompt);
  };

  const updateMetadata = (data: any, input: string) => {
    if (data.chatId) {
      setChatId(data.chatId);
    }

    // set message id that is needed for feedback
    if (data.chatMessageId) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'apiMessage') {
          allMessages[allMessages.length - 1].messageId = data.chatMessageId;
        }
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (input === '' && data.question) {
      // the response contains the question even if it was in an audio format
      // so if input is empty but the response contains the question, update the user message to show the question
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 2].type === 'apiMessage') return allMessages;
        allMessages[allMessages.length - 2].message = data.question;
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (data.followUpPrompts) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
        allMessages[allMessages.length - 1].followUpPrompts = data.followUpPrompts;
        addChatMessage(allMessages);
        return allMessages;
      });
      setFollowUpPrompts(JSON.parse(data.followUpPrompts));
    }
  };

  const fetchResponseFromEventStream = async (chatflowid: string, params: any) => {
    const chatId = params.chatId;
    const input = params.question;
    params.streaming = true;
    fetchEventSource(`${props.apiHost}/api/v1/prediction/${chatflowid}`, {
      openWhenHidden: true,
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
      async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
          return; // everything's good
        } else if (response.status === 429) {
          const errMessage = (await response.text()) ?? 'Too many requests. Please try again later.';
          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 403) {
          const errMessage = (await response.text()) ?? 'Unauthorized';
          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 401) {
          const errMessage = (await response.text()) ?? 'Unauthenticated';
          handleError(errMessage);
          throw new Error(errMessage);
        } else {
          throw new Error();
        }
      },
      async onmessage(ev) {
        const payload = JSON.parse(ev.data);
        switch (payload.event) {
          case 'start':
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
            break;
          case 'token':
            updateLastMessage(payload.data);
            break;
          case 'sourceDocuments':
            updateLastMessageSourceDocuments(payload.data);
            break;
          case 'usedTools':
            updateLastMessageUsedTools(payload.data);
            break;
          case 'fileAnnotations':
            updateLastMessageFileAnnotations(payload.data);
            break;
          case 'agentReasoning':
            updateLastMessageAgentReasoning(payload.data);
            break;
          case 'action':
            updateLastMessageAction(payload.data);
            break;
          case 'artifacts':
            updateLastMessageArtifacts(payload.data);
            break;
          case 'metadata':
            updateMetadata(payload.data, input);
            break;
          case 'error':
            updateErrorMessage(payload.data);
            break;
          case 'abort':
            abortMessage();
            closeResponse();
            break;
          case 'end':
            setLocalStorageChatflow(chatflowid, chatId);
            closeResponse();
            break;
        }
      },
      async onclose() {
        closeResponse();
      },
      onerror(err) {
        console.error('EventSource Error: ', err);
        closeResponse();
        throw err;
      },
    });
  };

  const closeResponse = () => {
    setLoading(false);
    setUserInput('');
    setUploadedFiles([]);
    hasSoundPlayed = false;
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const abortMessage = () => {
    setIsMessageStopping(false);
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      const lastAgentReasoning = allMessages[allMessages.length - 1].agentReasoning;
      if (lastAgentReasoning && lastAgentReasoning.length > 0) {
        allMessages[allMessages.length - 1].agentReasoning = lastAgentReasoning.filter((reasoning) => !reasoning.nextAgent);
      }
      return allMessages;
    });
  };

  const handleFileUploads = async (uploads: IUploads) => {
    if (!uploadedFiles().length) return uploads;

    if (fullFileUpload()) {
      const filesWithFullUploadType = uploadedFiles().filter((file) => file.type === 'file:full');

      if (filesWithFullUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithFullUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', chatId());

        const response = await createAttachmentWithFormData({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          const data = response.data as any;
          for (const extractedFileData of data) {
            const content = extractedFileData.content;
            const fileName = extractedFileData.name;

            // find matching name in previews and replace data with content
            const uploadIndex = uploads.findIndex((upload) => upload.name === fileName);
            if (uploadIndex !== -1) {
              uploads[uploadIndex] = {
                ...uploads[uploadIndex],
                data: content,
                name: fileName,
                type: 'file:full',
              };
            }
          }
        }
      }
    } else if (uploadsConfig()?.isRAGFileUploadAllowed) {
      const filesWithRAGUploadType = uploadedFiles().filter((file) => file.type === 'file:rag');

      if (filesWithRAGUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithRAGUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', chatId());

        const response = await upsertVectorStoreWithFormData({
          chatflowid: props.chatflowid,
          apiHost: props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          // delay for vector store to be updated
          const delay = (delayInms: number) => {
            return new Promise((resolve) => setTimeout(resolve, delayInms));
          };
          await delay(2500); //TODO: check if embeddings can be retrieved using file name as metadata filter

          uploads = uploads.map((upload) => {
            return {
              ...upload,
              type: 'file:rag',
            };
          });
        }
      }
    }
    return uploads;
  };

  // Handle form submission
  const handleSubmit = async (value: string, action?: IAction | undefined | null) => {
    if (value.trim() === '') {
      const containsFile = previews().filter((item) => !item.mime.startsWith('image') && item.type !== 'audio').length > 0;
      if (!previews().length || (previews().length && containsFile)) {
        return;
      }
    }

    setLoading(true);
    scrollToBottom();
    let uploads: IUploads = previews().map((item) => {
      return {
        data: item.data,
        type: item.type,
        name: item.name,
        mime: item.mime,
      };
    });

    try {
      uploads = await handleFileUploads(uploads);
    } catch (error) {
      handleError('Unable to upload documents');
      return;
    }

    clearPreviews();

    switch (props.flow) {
      case Flow.CriticalAnalysis.toString(): {
        await processCriticalAnalysisMissingData(value, uploads);
        break;
      }
      case Flow.taxClassification.toString(): {
        await discoverNcm(value);
        break;
      }
      default: {
        setUploading(false);
        setMessages((prevMessages) => {
          const messages: MessageType[] = [...prevMessages, { message: value, type: 'userMessage', fileUploads: uploads }];
          addChatMessage(messages);
          return messages;
        });

        const body: IncomingInput = {
          question: value,
          chatId: chatId(),
        };

        if (uploads && uploads.length > 0) body.uploads = uploads;

        if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig;

        if (leadEmail()) body.leadEmail = leadEmail();

        if (action) body.action = action;

        if (isChatFlowAvailableToStream()) {
          fetchResponseFromEventStream(props.chatflowid, body);
        } else {
          const result = await sendMessageQuery({
            chatflowid: props.chatflowid,
            apiHost: props.apiHost,
            body,
            onRequest: props.onRequest,
          });

          if (result.data) {
            const data = result.data;

            let text = '';
            if (data.text) text = data.text;
            else if (data.json) text = JSON.stringify(data.json, null, 2);
            else text = JSON.stringify(data, null, 2);

            if (data?.chatId) setChatId(data.chatId);

            playReceiveSound();

            setMessages((prevMessages) => {
              const allMessages = [...cloneDeep(prevMessages)];
              const newMessage = {
                message: text,
                id: data?.chatMessageId,
                sourceDocuments: data?.sourceDocuments,
                usedTools: data?.usedTools,
                fileAnnotations: data?.fileAnnotations,
                agentReasoning: data?.agentReasoning,
                action: data?.action,
                artifacts: data?.artifacts,
                type: 'apiMessage' as messageType,
                feedback: null,
                dateTime: new Date().toISOString(),
              };
              allMessages.push(newMessage);
              addChatMessage(allMessages);
              return allMessages;
            });

            updateMetadata(data, value);
            setLoading(false);
            setUserInput('');
            setUploadedFiles([]);
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
          break;
        }

        // Update last question to avoid saving base64 data to localStorage
        if (uploads && uploads.length > 0) {
          setMessages((data) => {
            const messages = data.map((item, i) => {
              if (i === data.length - 2 && item.type === 'userMessage') {
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
      }
    }
  };

  const discoverNcm = async (inputValue: string) => {
    updateMessages(inputValue, []);
    const ncmAnalysis = await sendBackgroundMessage(inputValue, []);
    setMessages((prevMessages) => {
      const newMessage = { message: ncmAnalysis.text, type: 'apiMessage' } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated];
    });
    setLoading(false);
  };

  const processCriticalAnalysisMissingData = async (inputValue: string, fileUploads: FileUpload[]) => {
    updateMessages(inputValue, fileUploads);
    const promptInformMissingData = `CORRIGE_JSON\n${JSON.stringify(jsonResponseCriticalAnalysis())}\ntext:${inputValue}`;
    const jsonCriticalAnalysisUpdate = await sendBackgroundMessage(promptInformMissingData, fileUploads);
    await processCriticalAnalysisUpdate(jsonCriticalAnalysisUpdate);
  };

  const updateMessages = (inputValue: string, fileUploads: any[]) => {
    setMessages((prevMessages) => {
      const newMessages: MessageType[] = [...prevMessages, { message: inputValue, type: 'userMessage', fileUploads }];
      addChatMessage(newMessages);
      return newMessages;
    });
  };

  const processCriticalAnalysisUpdate = async (jsonCriticalAnalysisUpdate: any, processedFile?: boolean) => {
    try {
      let jsonDataCriticalAnalysis = jsonCriticalAnalysisUpdate;
      if (!processedFile) {
        jsonDataCriticalAnalysis = JSON.parse(jsonCriticalAnalysisUpdate.text);
      }

      for (const key in jsonDataCriticalAnalysis) {
        const normalizedKey = removeAccents(key);

        if (/estado/i.test(normalizedKey)) {
          jsonDataCriticalAnalysis[key] = normalizeLocationNames(jsonDataCriticalAnalysis[key], locationValues.STATE);
        }

        if (/pais/i.test(normalizedKey)) {
          jsonDataCriticalAnalysis[key] = normalizeLocationNames(jsonDataCriticalAnalysis[key], locationValues.COUNTRY);
        }
        if (/ncm/i.test(normalizedKey) || hsCodeRegex.test(normalizedKey)) {
          const oldJson: { [key: string]: any } = { ...jsonResponseCriticalAnalysis() };
          jsonDataCriticalAnalysis[key] = sanitizeToFlatArray(jsonDataCriticalAnalysis[key]);
          jsonDataCriticalAnalysis[key] = compareAndMergeArrays(oldJson[key], jsonDataCriticalAnalysis[key]);
          if (!isNonEmptyArrayOrObject(jsonDataCriticalAnalysis[key])) {
            jsonDataCriticalAnalysis[key] = null;
          }
        }
      }

      setJsonResponseCriticalAnalysis(jsonDataCriticalAnalysis);

      let criticalAnalysisMessage = `<b>${messageUtils.CRITICAL_ANALYSIS_REQUIRED_DATA_LABEL}</b><br>`;
      for (const [key, value] of Object.entries(jsonDataCriticalAnalysis)) {
        criticalAnalysisMessage += generateItemToPrint(key, value as string);
      }

      setMessages((prevMessages) => {
        const newMessage = { message: criticalAnalysisMessage, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
      if (props.chatflowid && props.apiHost && chatId()) {
        await historyChatFlowiseApi.setFlowiseChatHistory(props.apiHost, props.chatflowid, chatId(), criticalAnalysisMessage, ChatRole.apiMessage);
      }

      if (criticalAnalysisMessage.includes(messageUtils.DATA_NOT_FOUND)) {
        setLoading(false);
        setMessages((prevMessages) => {
          const newMessage = { message: messageUtils.CRITICAL_ANALYSIS_MISSING_DATA, type: 'apiMessage' } as MessageType;
          const updated = [...prevMessages, newMessage];
          addChatMessage(updated);
          return [...updated];
        });
        setMessages((prevMessages) => {
          const newMessage = { message: messageUtils.CRITICAL_ANALYSIS_MISSING_NCM, type: 'apiMessage' } as MessageType;
          const updated = [...prevMessages, newMessage];
          addChatMessage(updated);
          return [...updated];
        });
      } else {
        const ncmArray = jsonDataCriticalAnalysis['NCM'] as string[];
        const validatedNcmArray = await validateNcmArray(ncmArray);
        const ncmErrorsArray = validatedNcmArray.isNotNcm.map((ncm) => ncm.ncm);
        const ncmSuccessArray = validatedNcmArray.isNcm.map((ncm) => ncm.ncm);
        const mergedResults = [...validatedNcmArray.isNcm, ...validatedNcmArray.isNotNcm];
        setMessagesFromValidationResults(mergedResults);
        const jsonResponse = jsonDataCriticalAnalysis;
        jsonResponse['NCM'] = ncmSuccessArray;
        setJsonResponseCriticalAnalysis(jsonResponse);

        if (validatedNcmArray.isNotNcm.length) {
          const isPlural = validatedNcmArray.isNotNcm.length > 1;
          let criticalAnalysisMessage = `<b>${messageUtils.CRITICAL_ANALYSIS_REQUIRED_DATA_LABEL}</b><br>`;
          for (const [key, value] of Object.entries(jsonDataCriticalAnalysis)) {
            criticalAnalysisMessage += generateItemToPrint(key, value as string);
          }
          setMessages((prevMessages) => {
            const newMessage = { message: criticalAnalysisMessage, type: 'apiMessage' } as MessageType;
            const updated = [...prevMessages, newMessage];
            addChatMessage(updated);
            return [...updated];
          });
          setMessages((prevMessages) => {
            const newMessage = { message: criticalAnalysisNcmErrorMessage(ncmErrorsArray, isPlural), type: 'apiMessage' } as MessageType;
            const updated = [...prevMessages, newMessage];
            addChatMessage(updated);
            return [...updated];
          });
          setLoading(false);
          return;
        }

        setMessages((prevMessages) => {
          const newMessage = { message: messageUtils.CRITICAL_ANALYSIS_SUBMISSION_SUCCESS, type: 'apiMessage' } as MessageType;
          const updated = [...prevMessages, newMessage];
          addChatMessage(updated);
          return [...updated, { message: '', type: 'apiMessage' }];
        });
        await getCriticalAnalysisStepResults(ncmArray, jsonDataCriticalAnalysis);
        setLoading(false);

        setJsonResponseCriticalAnalysis({});
      }

      if (!isChatFlowAvailableToStream()) {
        updateLastMessage(criticalAnalysisMessage);
      } else {
        updateLastMessage('');
      }
    } catch (error) {
      console.error(messageUtils.CRITICAL_ANALYSIS_PROCESSING_ERROR, error);
      throw error;
    }
  };
  const isNCM = async (ncm: string): Promise<{ ncm: string; valid: boolean; message: string }> => {
    const formattedNcm = ncm.replace(/\D\./g, '');
    const ncmDigitNumber = 8;
    if (formattedNcm.length !== ncmDigitNumber) {
      return { ncm: ncm, valid: false, message: ncmLengthErrorMessage(ncm) };
    }
    try {
      const doesNcmExist = await verifyNcmExistence(formattedNcm);
      if (!doesNcmExist) {
        return { ncm: ncm, valid: false, message: ncmExistenceErrorMessage(ncm) };
      }
      return { ncm: ncm, valid: true, message: ncmSuccessValidation(ncm) };
    } catch {
      return { ncm: ncm, valid: true, message: ncmValidationErrorMessage(ncm) };
    }
  };

  const setMessagesFromValidationResults = (validationResults: { ncm: string; valid: boolean; message: string }[]) => {
    setMessages((prevMessages) => {
      const newMessages = validationResults.map((result) => ({
        message: result.message,
        type: 'apiMessage',
      })) as MessageType[];
      const updated = [...prevMessages, ...newMessages];
      addChatMessage(updated);
      return updated;
    });
  };

  const validateNcmArray = async (ncmArray: string[]) => {
    const validationResults: {
      isNcm: { ncm: string; valid: boolean; message: string }[];
      isNotNcm: { ncm: string; valid: boolean; message: string }[];
    } = {
      isNcm: [],
      isNotNcm: [],
    };
    setMessages((prevMessages) => {
      const newMessage = { message: messageUtils.CRITICAL_ANALYSIS_NCM_VALIDATION, type: 'apiMessage' } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated, { message: '', type: 'apiMessage' }];
    });
    for (const ncm of ncmArray) {
      const validatedNCM = await isNCM(ncm);
      if (validatedNCM.valid === false) {
        validationResults.isNotNcm.push(validatedNCM);
      } else {
        validationResults.isNcm.push(validatedNCM);
      }
    }
    return validationResults;
  };

  const processNcm = async (prefix: string, ncm: string, jsonDataCriticalAnalysis: any, includeNcm: boolean) => {
    let message = includeNcm ? `\n**NCM: ${ncm}**\n` : '';
    const jsonDataWithNcm = { ...jsonDataCriticalAnalysis, NCM: ncm };
    const finalPayload = prefix + JSON.stringify(jsonDataWithNcm);

    try {
      const stepResultByNcm = await sendBackgroundMessage(finalPayload, []);
      message += `\n${stepResultByNcm.text}\n`;
    } catch (error) {
      console.error(error);
      message += `\n${ncmStepFailureMessage(prefix, ncm)}\n`;
    }
    return message;
  };

  const getCriticalAnalysisStepResults = async (ncmArray: string[], jsonDataCriticalAnalysis: any) => {
    for (const prefix of Object.values(CriticalAnalysisPrefixes)) {
      let message = '';
      const warningMessage = criticalAnalysisWarningMapping[prefix];
      message = `**${criticalAnalysisStepNameMapping[prefix]}**\n`;
      if (warningMessage) {
        message += `\n**${warningMessage}**\n`;
      }

      const singleExecutionSteps = [CriticalAnalysisPrefixes.criticalAnalysisFourthStep, CriticalAnalysisPrefixes.criticalAnalysisFifthStep];
      const isStepOfSingleExecution = singleExecutionSteps.includes(prefix);

      if (isStepOfSingleExecution) {
        message += await processNcm(prefix, ncmArray[0], jsonDataCriticalAnalysis, false);
      } else {
        for (const ncm of ncmArray) {
          message += await processNcm(prefix, ncm, jsonDataCriticalAnalysis, true);
        }
      }

      setMessages((prevMessages) => {
        const newMessage = { message: message, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated, { message: '', type: 'apiMessage' }];
      });
    }
  };
  const generateItemToPrint = (key: string, value: string, isChecklistItem = false) => {
    const isHsCode = hsCodeRegex.test(key);
    const spacedText = (text: string) => `<div style="padding-left: 20px; margin-bottom: 10px;">${text}</div>`;
    const hasValue = value !== 'null' && value !== null;
    const checkboxStyle = hasValue && !isChecklistItem ? 'color: white; background-color: #136FEE; ' : '';
    const readonlyAttribute = isChecklistItem ? '' : 'readonly onclick="return false;"';
    const noValueText = isChecklistItem || isHsCode ? 'N/A' : 'Valor não encontrado ou não preenchido.';

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
      const newChatId = (props.chatflowConfig?.vars as any)?.customerId
        ? `${(props.chatflowConfig?.vars as any).customerId.toString()}+${uuidv4()}`
        : uuidv4();

      setChatId(newChatId);
      setLocalStorageChatflow(props.chatflowid, newChatId);
      setUploadedFiles([]);
      window.location.reload();

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

  onMount(() => {
    if (props.clearChatOnReload) {
      clearChat();
      window.addEventListener('beforeunload', clearChat);
      return () => {
        window.removeEventListener('beforeunload', clearChat);
      };
    }
  });

  createEffect(() => {
    if (props.starterPrompts) {
      let prompts: string[];

      if (Array.isArray(props.starterPrompts)) {
        // If starterPrompts is an array
        prompts = props.starterPrompts;
      } else {
        // If starterPrompts is a JSON object
        prompts = Object.values(props.starterPrompts).map((promptObj: { prompt: string }) => promptObj.prompt);
      }

      // Filter out any empty prompts
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
    if (props.disclaimer) {
      if (getCookie('chatbotDisclaimer') == 'true') {
        setDisclaimerPopupOpen(false);
      } else {
        setDisclaimerPopupOpen(true);
      }
    } else {
      setDisclaimerPopupOpen(false);
    }

    const chatMessage = getLocalStorageChatflow(props.chatflowid);
    if (chatMessage && Object.keys(chatMessage).length) {
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
                rating: message.rating,
                dateTime: message.dateTime,
              };
              if (message.sourceDocuments) chatHistory.sourceDocuments = message.sourceDocuments;
              if (message.fileAnnotations) chatHistory.fileAnnotations = message.fileAnnotations;
              if (message.fileUploads) chatHistory.fileUploads = message.fileUploads;
              if (message.agentReasoning) chatHistory.agentReasoning = message.agentReasoning;
              if (message.action) chatHistory.action = message.action;
              if (message.artifacts) chatHistory.artifacts = message.artifacts;
              if (message.followUpPrompts) chatHistory.followUpPrompts = message.followUpPrompts;
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
      onRequest: props.onRequest,
    });

    if (data) {
      setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
    }

    // Get the chatbotConfig
    const result = await getChatbotConfig({
      chatflowid: props.chatflowid,
      apiHost: props.apiHost,
      onRequest: props.onRequest,
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
      if (chatbotConfig.followUpPrompts) {
        setFollowUpPromptsStatus(chatbotConfig.followUpPrompts.status);
      }
      if (chatbotConfig.fullFileUpload) {
        setFullFileUpload(chatbotConfig.fullFileUpload.status);
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
      setUploadedFiles([]);
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

  createEffect(() => {
    if (followUpPromptsStatus() && messages().length > 0) {
      const lastMessage = messages()[messages().length - 1];
      if (lastMessage.type === 'apiMessage' && lastMessage.followUpPrompts) {
        setFollowUpPrompts(JSON.parse(lastMessage.followUpPrompts));
      } else if (lastMessage.type === 'userMessage') {
        setFollowUpPrompts([]);
      }
    }
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
    if (fullFileUpload()) {
      return true;
    }
    if (uploadsConfig() && uploadsConfig()?.isRAGFileUploadAllowed && uploadsConfig()?.fileUploadSizeAndTypes) {
      const fileExt = file.name.split('.').pop();
      if (fileExt) {
        uploadsConfig()?.fileUploadSizeAndTypes.map((allowed) => {
          if (allowed.fileTypes.length === 1 && allowed.fileTypes[0] === '*') {
            acceptFile = true;
          } else if (allowed.fileTypes.includes(`.${fileExt}`)) {
            acceptFile = true;
          }
        });
      }
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
    const uploadedFiles = [];
    for (const file of files) {
      if (isFileAllowedForUpload(file) === false) {
        return;
      }
      // Only add files
      if (
        !uploadsConfig()
          ?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes)
          .join(',')
          .includes(file.type)
      ) {
        uploadedFiles.push({ file, type: fullFileUpload() ? 'file:full' : 'file:rag' });
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
    setUploadedFiles(uploadedFiles);
    setPreviews((prevPreviews) => [...prevPreviews, ...(newFiles as FilePreview[])]);
  };

  const isFileUploadAllowed = () => {
    if (fullFileUpload()) {
      return true;
    } else if (uploadsConfig()?.isRAGFileUploadAllowed) {
      return true;
    }
    return false;
  };

  const handleDrag = (e: DragEvent) => {
    if (uploadsConfig()?.isImageUploadAllowed || isFileUploadAllowed()) {
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
    if (!uploadsConfig()?.isImageUploadAllowed && !isFileUploadAllowed) {
      return;
    }
    e.preventDefault();
    setIsDragActive(false);
    const files = [];
    const uploadedFiles = [];
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      for (const file of e.dataTransfer.files) {
        if (isFileAllowedForUpload(file) === false) {
          return;
        }
        // Only add files
        if (
          !uploadsConfig()
            ?.imgUploadSizeAndTypes.map((allowed) => allowed.fileTypes)
            .join(',')
            .includes(file.type)
        ) {
          uploadedFiles.push({ file, type: fullFileUpload() ? 'file:full' : 'file:rag' });
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
      setUploadedFiles(uploadedFiles);
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

  const previewDisplay = (item: FilePreview) => {
    if (item.mime.startsWith('image/')) {
      return (
        <button
          class="group w-12 h-12 flex items-center justify-center relative rounded-[10px] overflow-hidden transition-colors duration-200"
          onClick={() => handleDeletePreview(item)}
        >
          <img class="w-full h-full bg-cover" src={item.data as string} />
          <span class="absolute hidden group-hover:flex items-center justify-center z-10 w-full h-full top-0 left-0 bg-black/10 rounded-[10px] transition-colors duration-200">
            <TrashIcon />
          </span>
        </button>
      );
    } else if (item.mime.startsWith('audio/')) {
      return (
        <div
          class={`inline-flex basis-auto flex-grow-0 flex-shrink-0 justify-between items-center rounded-xl h-12 p-1 mr-1 bg-gray-500`}
          style={{
            width: `${chatContainer ? (botProps.isFullPage ? chatContainer?.offsetWidth / 4 : chatContainer?.offsetWidth / 2) : '200'}px`,
          }}
        >
          <audio class="block bg-cover bg-center w-full h-full rounded-none text-transparent" controls src={item.data as string} />
          <button class="w-7 h-7 flex items-center justify-center bg-transparent p-1" onClick={() => handleDeletePreview(item)}>
            <TrashIcon color="white" />
          </button>
        </div>
      );
    } else {
      return <FilePreview disabled={getInputDisabled()} item={item} onDelete={() => handleDeletePreview(item)} />;
    }
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

  const startProcessingFiles = async (files: UploadFile[]) => {
    if (props.flow === Flow.taxClassification.toString()) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.NCM_TEXT_INPUT_REQUIRED, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
      return;
    }

    setIsUploadModalOpen(false);
    setDisableInput(true);
    setIsUploadButtonDisabled(true);

    const filesMap: FileMapping[] = [];

    for (const file of files) {
      const fileMap = {
        file: file,
      } as FileMapping;
      const docType = identifyDocumentType(file.name);
      if (docType) {
        fileMap.type = docType;
        const checklist = identifyDocumentChecklist(docType);
        if (checklist) {
          fileMap.checklist = checklist;
          if (
            ![
              DocumentTypes.PACKING_LIST.toString(),
              DocumentTypes.CERTIFICADO_DE_ORIGEM.toString(),
              DocumentTypes.CCT.toString(),
              DocumentTypes.PROFORMA_INVOICE.toString(),
              DocumentTypes.COMMERCIAL_INVOICE.toString(),
              DocumentTypes.LABELS.toString(),
              DocumentTypes.MSDS.toString(),
              DocumentTypes.TEST_REPORT.toString(),
              DocumentTypes.CONHECIMENTO_CRT.toString(),
              DocumentTypes.CONHECIMENTO_MIC_DTA.toString(),
              DocumentTypes.CONHECIMENTO_HAWB.toString(),
              DocumentTypes.COTACAO_DE_FRETE.toString(),
            ].includes(docType)
          ) {
            fileMap.checklist = fileMap.checklist.concat(conferencesDefault);
          }
        } else {
          fileMap.type = DocumentTypes.DOCUMENTO_SEM_CHECKLIST;
          fileMap.checklist = defaultChecklist;
        }
      } else {
        fileMap.type = DocumentTypes.DOCUMENTO_SEM_CHECKLIST;
        fileMap.checklist = defaultChecklist;
      }
      filesMap.push(fileMap);
    }

    const orderedFiles = sortUploadFiles(filesMap);

    setFilesMapping(orderedFiles);

    switch (props.flow) {
      case Flow.CriticalAnalysis.toString():
        await processFileCriticalAnalysis();
        setIsUploadButtonDisabled(false);
        break;
      default:
        setMessages((prevMessages) => {
          const newMessage = { message: messageUtils.ALL_DOCUMENTS_VALIDATED_MESSAGE, type: 'apiMessage' } as MessageType;
          const updated = [...prevMessages, newMessage];
          addChatMessage(updated);
          return [...updated];
        });
        setDocumentsUploaded(true);
        setHiddenInput(true);
        await processNextChecklist();
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

  const extractNewChecklist = async (file: any, fileMap: any, urls: any) => {
    const maxAttempts = 3;

    if ([DocumentTypes.LICENCA_DE_IMPORTACAO, DocumentTypes.LPCO].includes(fileMap.type)) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.NO_LI_LPCO_COMPLIANCE_FEATURE, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
      setIsNextChecklistButtonDisabled(false);
      setLoading(false);
      return;
    }
    if (fileMap.type === DocumentTypes.COMMERCIAL_INVOICE) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.MANUAL_COMPLIANCE_ALERT, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
      // Hack to re-enable loading bubble
      setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' } as MessageType]);
    }

    const textContent = await getTextContent(file.file);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const checklistPrompt = `CHECKLIST\n${fileMap.checklist}\n\nPlain-text: ${textContent}\n\njson: `;
        const resultFromBackgroundMessage = await sendBackgroundMessage(checklistPrompt, urls);

        let jsonData = JSON.parse(resultFromBackgroundMessage?.text || '{}');
        jsonData = sanitizeJson(jsonData);

        if (Object.keys(jsonData).includes('error') && Object.keys(jsonData).length === 1) {
          throw new Error(jsonData.error);
        }

        fileMap.content = jsonData;
        fileMap.filledChecklist = jsonData;

        if (!Object.keys(jsonData).includes('checklist')) {
          throw new Error(messageUtils.CHECKLIST_NOT_FOUND_IN_RESPONSE_ERROR);
        }

        await documentService.saveDocumentData(fileMap, textContent, props.flow, chatId());
        structureAndSaveMessages(jsonData, fileMap, resultFromBackgroundMessage);

        if (fileMap.type === DocumentTypes.DOCUMENTO_SEM_CHECKLIST) {
          historyChatFlowiseApi.setFlowiseChatHistory(
            props.apiHost!,
            props.chatflowid,
            chatId(),
            messageUtils.DEFAULT_CHECKLIST_ALERT,
            ChatRole.apiMessage,
          );
          setMessages((prevMessages) => {
            const newMessage = { message: messageUtils.DEFAULT_CHECKLIST_ALERT, type: 'apiMessage' } as MessageType;
            const updated = [...prevMessages, newMessage];
            addChatMessage(updated);
            return [...updated, { message: '', type: 'apiMessage' } as MessageType];
          });
        }

        break;
      } catch (error) {
        console.error(error);
        if (attempt === maxAttempts) {
          const errorMessage = messageUtils.UNABLE_TO_PROCESS_CHECKLIST_MESSAGE;

          const documentErrors = [...documentsChecklistError()];
          documentErrors.push(fileMap.file.name);
          setDocumentsChecklistError(documentErrors);

          setMessages((prevMessages) => {
            const newMessage = { message: errorMessage, type: 'apiMessage' } as MessageType;
            const updated = [...prevMessages, newMessage];
            addChatMessage(updated);
            return [...updated];
          });
        }
      }
    }

    setIsNextChecklistButtonDisabled(false);
    setLoading(false);
  };

  const structureChecklistMessage = (jsonData: any, fileMap?: any) => {
    const generateChecklistItemToPrint = (key: string, value: any) => {
      if (value && typeof value === 'object') {
        const formatted_value = Object.entries(value)
          .map(([key, value]) => {
            const multiItemFormattedValue = String(value).replace(/; |\/n/g, '<br/>');
            return `${key}: ${multiItemFormattedValue}`;
          })
          .join('<br>');
        value = formatted_value;
      }

      const spacedText = (text: string) => `<div style="padding-left: 20px; margin-bottom: 10px;">${text}</div>`;
      const getMessage = (key: string, keyValue: any, validValue: boolean, justificationNotFound: boolean) => {
        const isSuccessfulMessage = validValue && !justificationNotFound;
        if (isSuccessfulMessage) {
          const multiItemFormattedValue = String(value).replace(/; |\/n/g, '<br/>');
          return spacedText(multiItemFormattedValue);
        }
        const defaultMessage = justificationNotFound ? keyValue : 'Não identificado';
        const signatureKey = 'Assinatura';
        const messageNotFoundSignature = 'A assinatura não foi identificada, por favor verifique manualmente!';
        const isSignatureKey = key === signatureKey;
        const exTariffRegex = /DESCRICAO[_-\s]?EX[_-\s]?TARIFARIO/i;
        const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let message = isSignatureKey ? messageNotFoundSignature : defaultMessage;

        if (exTariffRegex.test(normalizedKey)) {
          message = keyValue ? messageUtils.EX_TARIFF_IDENTIFIED : messageUtils.EX_TARIFF_NOT_IDENTIFIED;
        }

        return spacedText(`<span style="color: ${colorTheme.errorColor};">${message}</span>`);
      };

      const isValidValue = value !== null && customBooleanValues.NOT_FOUND.toString() !== value;
      const hasJustificationNotFound = value && value.includes(customBooleanValues.FALSE_WITH_JUSTIFICATION.toString());
      const shouldCheckboxBeChecked = isValidValue && !hasJustificationNotFound;

      let checklistItem = `<input type="checkbox" ${shouldCheckboxBeChecked ? 'checked' : ''} disabled> <b>${key}</b>:<br>`;
      checklistItem += getMessage(key, value, isValidValue, hasJustificationNotFound);

      return checklistItem;
    };

    let checklistMessage = '';

    if (fileMap) {
      checklistMessage = `<b>${fileMap.type}:</b><br>`;
    }

    for (const [key, value] of Object.entries(jsonData.checklist)) {
      checklistMessage += generateChecklistItemToPrint(key, value);
    }

    if (Object.keys(jsonData).includes('conferências') && jsonData['conferências'] !== null && Object.keys(jsonData['conferências']).length > 0) {
      checklistMessage += `<br><b>Verificações:</b><br>`;
      for (const [key, value] of Object.entries(jsonData['conferências'])) {
        checklistMessage += generateChecklistItemToPrint(key, value);
      }
    }
    return checklistMessage;
  };

  const saveCacheExtractionMessages = async (fileName: any, fileResults: any) => {
    if (props.apiHost && props.chatflowid && chatId()) {
      await historyChatFlowiseApi.setFlowiseChatHistory(props.apiHost, props.chatflowid, chatId(), fileName, ChatRole.userMessage);
      await historyChatFlowiseApi.setFlowiseChatHistory(props.apiHost, props.chatflowid, chatId(), fileResults, ChatRole.apiMessage);
    }
  };

  const showChecklistMessage = (jsonData: any, checklistMessage: string) => {
    setMessages((prevMessages) => {
      const newMessage = { message: checklistMessage, type: 'apiMessage' } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated];
    });

    const conferences = jsonData['conferências'];

    if (
      conferences &&
      ((Object.keys(conferences).includes('Máquina/Equipamento') && conferences['Máquina/Equipamento'] === 'true') ||
        (Object.keys(conferences).includes('Possui Ex-tarifário') && conferences['Possui Ex-tarifário'] === 'true'))
    ) {
      setMessages((prevMessages) => {
        const newMessage = { message: messageUtils.EX_TARIFF_CHECK_ALERT_MESSAGE, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
    }

    if (!isChatFlowAvailableToStream()) {
      updateLastMessage(checklistMessage);
    } else {
      updateLastMessage('');
    }
  };

  const structureAndSaveMessages = async (jsonData: any, fileMap?: any, resultFromBackgroundMessage?: any) => {
    const structureChecklistMessageHTML = structureChecklistMessage(jsonData, fileMap);
    showChecklistMessage(jsonData, structureChecklistMessageHTML);
  };

  const processNextChecklist = async () => {
    setUploading(true);
    setLoading(true);

    const files = filesMapping();

    if (files.length === 0) {
      await executeComplianceCheck(filesMapping());
      setIsUploadButtonDisabled(false);
      return;
    }

    setIsNextChecklistButtonDisabled(true);

    const fileMap = files[currentChecklistNumber()];
    const file = fileMap.file as UploadFile;
    const urls = await processFileToSend(file.file);

    setCurrentChecklistNumber(currentChecklistNumber() + 1);

    setUploading(false);
    setMessages((prevMessages) => {
      const newMessage = { message: `${file.name}`, type: 'userMessage', fileUploads: urls } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated];
    });

    let fileProcessed = null;

    if (![DocumentTypes.LICENCA_DE_IMPORTACAO.toString(), DocumentTypes.LPCO.toString()].includes(fileMap.type)) {
      fileProcessed = await documentService.getProcessedDocumentData(fileMap, props.flow, chatId());
    }

    if (fileProcessed && fileProcessed != 'null') {
      await saveCacheExtractionMessages(file.name, fileProcessed);
      let processedDocumentJson = JSON.parse(fileProcessed);
      processedDocumentJson = sanitizeJson(processedDocumentJson);
      structureAndSaveMessages(processedDocumentJson, fileMap);
      setIsNextChecklistButtonDisabled(false);
    } else {
      await extractNewChecklist(file, fileMap, urls);
    }

    try {
      setLoading(true);

      if (currentChecklistNumber() === files.length) {
        await executeComplianceCheck(filesMapping());
        setIsUploadButtonDisabled(false);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = messageUtils.UNABLE_TO_PROCESS_CROSS_VALIDATION_MESSAGE;

      setMessages((prevMessages) => {
        const newMessage = { message: errorMessage, type: 'apiMessage' } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
    } finally {
      setLoading(false);
      setIsNextChecklistButtonDisabled(false);
    }
  };

  const executeComplianceCheck = async (filledChecklists: FileMapping[]) => {
    setCurrentChecklistNumber(0);
    setDocumentsUploaded(false);
    setMessages((prevMessages) => {
      const newMessage = { message: '', type: 'apiMessage' } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated];
    });

    if (documentsChecklistError().length > 0) {
      const errorMessages = documentsChecklistError().join(', ');
      const isPlural = documentsChecklistError().length > 1;

      setMessages((prevMessages) => {
        const newMessage = {
          message: complianceErrorMessage(errorMessages, isPlural),
          type: 'apiMessage',
        } as MessageType;
        const updated = [...prevMessages, newMessage];
        addChatMessage(updated);
        return [...updated];
      });
      return;
    }
    const filesCheckList = await documentService.getDocumentsByChatId(chatId());

    let filteredFileMappings: FileMapping[] = [];

    if (filesCheckList) {
      const cacheFileMappings: FileMapping[] = filesCheckList.map((file: any) => ({
        file: {
          name: file.file_name,
          mime: file.mime,
          hash: file.hash,
        } as DatabaseProvidedFile,
        type: file.checklist_type,
        content: file.checklist_result,
        filledChecklist: file.checklist_result,
      }));
      filteredFileMappings = cacheFileMappings.filter((fileMapping) => fileMapping.content || fileMapping.filledChecklist);
    }

    const compareDocuments = new CompareDocuments({
      fileMappings: filteredFileMappings.length > 0 ? filteredFileMappings : filledChecklists,
      sendBackgroundMessage,
      setMessages,
    });
    const lastMessage = await compareDocuments.execute();
    if (lastMessage) {
      updateLastMessage('');
    }
  };

  const processFileCriticalAnalysis = async () => {
    setLoading(true);
    setDisableInput(false);
    setIsUploadButtonDisabled(false);

    const files = filesMapping().filter((item) => !!item);
    const fileMap = files[currentChecklistNumber()];
    const file = fileMap.file as UploadFile;
    const urls = await processFileToSend(file.file);
    setMessages((prevMessages) => {
      const newMessage = { message: `${file.name}`, type: 'userMessage', fileUploads: urls } as MessageType;
      const updated = [...prevMessages, newMessage];
      addChatMessage(updated);
      return [...updated];
    });

    const fileProcessed = await documentService.getProcessedDocumentData(fileMap, props.flow, chatId());

    if (fileProcessed && fileProcessed != 'null') {
      await saveCacheExtractionMessages(file.name, fileProcessed);
      let processedDocumentJson = JSON.parse(fileProcessed);
      processedDocumentJson = sanitizeJson(processedDocumentJson);
      await processCriticalAnalysisUpdate(processedDocumentJson, true);
    } else {
      await processNewFileData(file, files, urls);
    }

    scrollToBottom();
  };

  async function processNewFileData(file: any, files: any[], urls: Partial<FileUpload>[]) {
    const textContent = await getTextContent(file.file);

    const promptCriticalAnalysis = `VERIFICAR DADOS ANALISE CRITICA\n\nPlainText:${textContent} `;
    const dataFoundCriticalAnalysis = await sendBackgroundMessage(promptCriticalAnalysis, urls as any[]);

    for (const file of files) {
      documentService.saveDocumentData(file, textContent, props.flow, chatId(), dataFoundCriticalAnalysis);
    }
    await processCriticalAnalysisUpdate(dataFoundCriticalAnalysis);
  }

  const fetchAndProcessChatHistory = async () => {
    const chatDetails = localStorage.getItem(`${props.chatflowid}_EXTERNAL`);
    const localStorageData = chatDetails ? JSON.parse(chatDetails) : null;

    if (
      props.apiHost &&
      props.chatflowid &&
      ((!!localStorageData?.chatId && localStorageData?.chatId !== chatId()) || localStorageData?.chatHistory?.length === 0)
    ) {
      const chatHistory = await historyChatFlowiseApi.getFlowiseChatHistory(props.apiHost, props.chatflowid, localStorageData?.chatId || null);
      setChatId(localStorageData.chatId);
      const updatedMessages = processMessages(chatHistory);
      setLocalStorageChatflow(props.chatflowid, localStorageData?.chatId, { chatHistory: updatedMessages });
      setMessages(updatedMessages);
    }
  };
  const setInitialMessages = (messages: ChatMessage[]) => {
    messages.push({ content: props.welcomeMessage || '', role: 'apiMessage' } as ChatMessage);
    switch (props.flow) {
      case Flow.CriticalAnalysis.toString():
        messages.push({ content: messageUtils.CRITICAL_ANALYSIS_TEMPLATE, role: 'apiMessage' } as ChatMessage);
        break;
      case Flow.taxClassification.toString():
        messages.push({ content: messageUtils.NCM_DISCOVER_TEMPLATE, role: 'apiMessage' } as ChatMessage);
        break;
    }
    return messages;
  };

  const processMessages = (historyMessages: ChatMessage[]) => {
    const visibleMessages = setInitialMessages([]);

    let currentFileMap: FileMapping | null = null;

    for (const message of historyMessages) {
      const isUserMessage = message.role === 'userMessage';
      const isApiMessage = message.role === 'apiMessage';
      const contentJson = (() => {
        try {
          return JSON.parse(message.content);
        } catch {
          return null;
        }
      })();

      if (message.fileUploads !== null) {
        let documentName = '';
        if (message.fileUploads && message.fileUploads.length > 0) {
          const firstPageImageFileName = message.fileUploads[0].name;
          documentName = firstPageImageFileName.replace(/(?:[^\w]\d+)*\.\w+$/, '').trim();

          if (documentName[documentName.length - 1] === '0') {
            documentName = documentName.slice(0, -1);
          }
        }
        const mime = '';
        const hash = '';

        const file = { name: documentName, mime, hash };
        const type = identifyDocumentType(documentName);

        currentFileMap = { file, type };
      }

      if (isUserMessage) {
        const keywordsToIgnore = ['CROSS_VALIDATION', 'LIST_DIFFERENT_KEYS', 'Specific compliance', 'ANALISE_\\d##'];
        const discoverNCMKeyword = 'DESCOBRE_NCM';
        const userKeywordsTextToReformat = ['CORRIGE_JSON', discoverNCMKeyword];
        const userKeywordsFileToReformat = ['CHECKLIST', 'EXTRACTION', 'VERIFICAR DADOS ANALISE CRITICA'];
        const userKeywordsToReformat = [...userKeywordsFileToReformat, ...userKeywordsTextToReformat];
        const ignoreRegex = new RegExp(`^(${keywordsToIgnore.join('|')})`);
        const shouldIgnoreMessage = ignoreRegex.test(message.content);
        const shouldReformatMessage = userKeywordsToReformat.some((keyword: string) => message.content.startsWith(keyword));
        const shouldReformatTextMessage = userKeywordsTextToReformat.some((keyword: string) => message.content.startsWith(keyword));
        const shouldReformatFileMessage = userKeywordsFileToReformat.some((keyword: string) => message.content.startsWith(keyword));

        if (shouldIgnoreMessage) {
          continue;
        } else if (shouldReformatMessage) {
          let chatMessageToShow;
          if (shouldReformatFileMessage) {
            chatMessageToShow = {
              ...message,
              content: currentFileMap?.file.name || '',
            };
          } else if (shouldReformatTextMessage) {
            if (message.content.startsWith(discoverNCMKeyword)) {
              const discoverConfirmMessage = { content: messageUtils.YES, role: 'userMessage' } as ChatMessage;
              const discoverInstructionMessage = { content: messageUtils.NCM_DISCOVER_TEMPLATE, role: 'apiMessage' } as ChatMessage;
              visibleMessages.push(discoverConfirmMessage);
              visibleMessages.push(discoverInstructionMessage);
            }
            const chatSplit = message.content.split('text:');
            chatMessageToShow = {
              ...message,
              content: chatSplit[chatSplit.length - 1],
            };
          }
          if (chatMessageToShow) {
            visibleMessages.push(chatMessageToShow);
          }
        } else {
          visibleMessages.push(message);
        }
      } else if (isApiMessage) {
        if (contentJson !== null && Object.keys(contentJson).includes('checklist')) {
          const checklistHTML = structureChecklistMessage(contentJson, currentFileMap);
          const chatMessageToShow = {
            ...message,
            content: checklistHTML,
          };
          visibleMessages.push(chatMessageToShow);
        } else if (contentJson !== null) {
          continue;
        } else {
          visibleMessages.push(message);
        }
      }
    }

    const visibleHistoryMessages: MessageType[] = [];

    visibleMessages.map((item) => {
      const newMessage = {
        message: `${item.content}`,
        type: item.role,
        fileUploads: item.fileUploads ?? [],
        disabled: item.disabled,
      } as MessageType;

      visibleHistoryMessages.push(newMessage);
    });

    if (messages()?.length === 1) {
      setMessages((prevMessages) => {
        const updated = [...prevMessages, ...visibleHistoryMessages];
        return [...updated];
      });
    }

    return visibleHistoryMessages;
  };

  return (
    <>
      <div
        ref={botContainer}
        class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}
      >
        {isDragActive() && (uploadsConfig()?.isImageUploadAllowed || isFileUploadAllowed()) && (
          <div
            class="absolute top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white z-40 gap-2 border-2 border-dashed"
            style={{ 'border-color': props.bubbleBackgroundColor }}
          >
            <h2 class="text-xl font-semibold">Drop here to upload</h2>
            <For each={[...(uploadsConfig()?.imgUploadSizeAndTypes || []), ...(uploadsConfig()?.fileUploadSizeAndTypes || [])]}>
              {(allowed) => {
                return (
                  <>
                    <span>{allowed.fileTypes?.join(', ')}</span>
                    {allowed.maxUploadSize && <span>Max Allowed Size: {allowed.maxUploadSize} MB</span>}
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
              <DeleteButton
                newItemText={messageUtils.NEW_CHAT_BUTTON_LABEL}
                sendButtonColor={props.bubbleTextColor}
                type="button"
                isDisabled={messages().length === 1}
                class="my-2 ml-2"
                on:click={clearChat}
              >
                <span>Clear</span>
              </DeleteButton>
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
                        renderHTML={props.renderHTML}
                      />
                    )}
                    {message.type === 'apiMessage' && message.message !== '' && (
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
                        sourceDocsTitle={props.sourceDocsTitle}
                        handleSourceDocumentsClick={(sourceDocuments) => {
                          setSourcePopupSrc(sourceDocuments);
                          setSourcePopupOpen(true);
                        }}
                        dateTimeToggle={props.dateTimeToggle}
                        renderHTML={props.renderHTML}
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
                    {message.type === 'apiMessage' && message.message === '' && loading() && index() === messages().length - 1 && (
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
          <Show when={messages().length > 2 && followUpPromptsStatus()}>
            <Show when={followUpPrompts().length > 0}>
              <>
                <div class="flex items-center gap-1 px-5">
                  <SparklesIcon class="w-4 h-4" />
                  <span class="text-sm text-gray-700">Try these prompts</span>
                </div>
                <div class="w-full flex flex-row flex-wrap px-5 py-[10px] gap-2">
                  <For each={[...followUpPrompts()]}>
                    {(prompt, index) => (
                      <FollowUpPromptBubble
                        prompt={prompt}
                        onPromptClick={() => followUpPromptClick(prompt)}
                        starterPromptFontSize={botProps.starterPromptFontSize} // Pass it here as a number
                      />
                    )}
                  </For>
                </div>
              </>
            </Show>
          </Show>
          <Show when={previews().length > 0}>
            <div class="w-full flex items-center justify-start gap-2 px-5 pt-2 border-t border-[#eeeeee]">
              <For each={[...previews()]}>{(item) => <>{previewDisplay(item)}</>}</For>
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

            {(startUploadingDocument() && documentsUploaded() && !hiddenInput()) || !startUploadingDocument() ? (
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
                  inputValue={userInput()}
                  onInputChange={(value) => setUserInput(value)}
                  onSubmit={handleSubmit}
                  uploadsConfig={uploadsConfig()}
                  isFullFileUpload={fullFileUpload()}
                  setPreviews={setPreviews}
                  onMicrophoneClicked={onMicrophoneClicked}
                  handleFileChange={handleFileChange}
                  sendMessageSound={props.textInput?.sendMessageSound}
                  sendSoundLocation={props.textInput?.sendSoundLocation}
                  enableInputHistory={true}
                  maxHistorySize={10}
                  startProcessingFiles={startProcessingFiles}
                  setIsUploadModalOpen={setIsUploadModalOpen}
                />
              )
            ) : (
              <>
                <UploadButton
                  onClick={() => setIsUploadModalOpen(true)}
                  text={messageUtils.UPLOAD_BUTTON_LABEL}
                  disabled={isUploadButtonDisabled()}
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
          <FileUploadModal
            isOpen={isUploadModalOpen()}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSubmit={startProcessingFiles}
            modalTitle={messageUtils.MODAL_TITLE}
            uploadLabel={messageUtils.UPLOADING_LABEL}
            uploadingButtonLabel={messageUtils.MODAL_BUTTON}
            errorMessage={messageUtils.FILE_TYPE_NOT_SUPPORTED}
            uploadLimit={props.flow === Flow.CriticalAnalysis.toString() ? 1 : undefined}
          />
        </div>
      </div>
      {sourcePopupOpen() && <Popup isOpen={sourcePopupOpen()} value={sourcePopupSrc()} onClose={() => setSourcePopupOpen(false)} />}

      {disclaimerPopupOpen() && (
        <DisclaimerPopup
          isOpen={disclaimerPopupOpen()}
          onAccept={handleDisclaimerAccept}
          title={props.disclaimer?.title}
          message={props.disclaimer?.message}
          buttonText={props.disclaimer?.buttonText}
        />
      )}
    </>
  );
};
