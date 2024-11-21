import { For, createEffect, createSignal } from 'solid-js';
import styles from '../../../assets/menu.css';
import { MenuButton } from './MenuButton';
import { MenuItem, MenuItemProps } from './MenuItem';
import { LogoInterseas } from '@/components/icons/LogoInterseas';
import { XIcon, DotsHorizontal, TrashIcon, PenEditIcon } from '@/components/icons';
import DocumentsDBService from '@/service/documentsDBService';
import DeleteModal from './DeleteModal';

const documentService = new DocumentsDBService();
export interface MenuProps {
  currentFlow: string;
  items: MenuItemProps[];
  fillColor?: string;
}
interface ChatItem {
  agent_flow: string;
  chat_name: string | null;
  created_at: string;
  id: string;
  updated_at: string | null;
}
export const Menu = (props: MenuProps) => {
  const [open, setOpen] = createSignal(false);
  const [openDeleteModal, setIsOpenDeleteModal] = createSignal<boolean>(false);
  const [currentFlow, setCurrentFLow] = createSignal(localStorage.getItem('currentFlow') || props.currentFlow);
  const [groupedChatItems, setGroupedChatItems] = createSignal<{ groups: Record<string, ChatItem[]>; labels: Record<string, string> }>({
    groups: {},
    labels: {},
  });
  const [editingChatId, setEditingChatId] = createSignal<string | null>(null);
  const [openMenuOptions, setOpenMenuOptions] = createSignal<string | null>(null);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const [inputValue, setInputValue] = createSignal<string>('');
  const [modalPosition, setModalPosition] = createSignal<'top' | 'bottom'>('bottom');
  const [selectedChatId, setSelectedChatId] = createSignal<string | null>(null);
  const [selectedChatName, setSelectedChatName] = createSignal<string | null>(null);

  const handleClick = (flow: string) => {
    setCurrentFLow(flow);
    localStorage.setItem('currentFlow', flow);
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue(target.value);
  };

  const toggleMenuOptions = (chatId: string, buttonRef: HTMLButtonElement) => {
    const isOpen = openMenuOptions() === chatId;
    setOpenMenuOptions(isOpen ? null : chatId);
    setEditingChatId(null);

    if (!isOpen) {
      const buttonRect = buttonRef.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < 200 && spaceAbove > 200) {
        setModalPosition('top');
      } else {
        setModalPosition('bottom');
      }
    }
  };

  const startEditing = (chatId: string) => {
    setIsEditing(true);
    setEditingChatId(chatId);
    setOpenMenuOptions(null);
  };

  const handleOpenDeleteModal = (chatId: string, chatName: string) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
    setIsOpenDeleteModal(true);
    setOpenMenuOptions(null);
  };

  const handleConfirmDelete = async () => {
    setIsOpenDeleteModal(false);
    if (selectedChatId()) {
      await documentService.deleteChat(selectedChatId() as string);
      fetchChatIds();
    }
  };

  const getChatHistoryTitle = () => {
    if (currentFlow() === 'compliance') {
      return 'Análise de Compliance';
    } else if (currentFlow() === 'critical_analysis') {
      return 'Análise Crítica';
    } else {
      return 'Estimativa de Custos';
    }
  };

  const formatDateChat = (item: ChatItem) => {
    if (item.chat_name) {
      return item.chat_name;
    } else {
      const date = new Date(item.created_at);
      return `Sem título - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  };

  const preprocessChatItems = (chatItems: ChatItem[]) => {
    const groups = {
      today: [] as ChatItem[],
      yesterday: [] as ChatItem[],
      lastWeek: [] as ChatItem[],
      lastMonth: [] as ChatItem[],
      older: [] as ChatItem[],
    };
    const labels = {
      today: 'Hoje',
      yesterday: 'Ontem',
      lastWeek: 'Últimos 7 dias',
      lastMonth: 'Últimos 30 dias',
      older: '30 dias ou mais atrás',
    };

    const adjustToBrazilTime = (date: Date) => {
      // Manual adjustment for Brazil time zone (UTC-3)
      const offset = -3 * 60; // UTC-3 in minutes
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      return new Date(utcDate.getTime() + offset * 60000);
    };

    // Sort chatItems by created_at in descending order
    chatItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    chatItems.forEach((item) => {
      const date = adjustToBrazilTime(new Date(item.created_at));
      const now = adjustToBrazilTime(new Date());

      // Zero out hours, minutes, seconds, and milliseconds for day comparison
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = Math.abs(nowOnly.getTime() - dateOnly.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups.today.push(item);
      } else if (diffDays === 1) {
        groups.yesterday.push(item);
      } else if (diffDays <= 7) {
        groups.lastWeek.push(item);
      } else if (diffDays <= 30) {
        groups.lastMonth.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return { groups, labels };
  };

  const fetchChatIds = async () => {
    const data = await documentService.getChatIdsByFlow(currentFlow());
    if (data && Array.isArray(data)) {
      setGroupedChatItems(preprocessChatItems(data as ChatItem[]));
    }
  };

  const handleEditSubmit = async (event: Event, chatId: string) => {
    event.preventDefault();
    if (chatId.length > 0) {
      await documentService.updateChatName(chatId, inputValue());
      fetchChatIds();
    }
    setIsEditing(false);
    setEditingChatId(null);
  };

  createEffect(() => {
    fetchChatIds();
  });

  return (
    <>
      <style>{styles}</style>
      <div class="menu">
        {open() ? (
          <div class="menu-wrapper">
            <div class="menu-content">
              <div class="menu-header">
                <div class="logo">
                  <LogoInterseas />
                </div>
                <button class="close-button" onClick={() => setOpen(false)}>
                  <XIcon color="#000000" />
                </button>
              </div>
              <div class="menu-items">
                <div class="menu-text">Escolha qual tarefa deseja realizar</div>
                <For each={props.items}>
                  {(item) => <MenuItem {...item} selected={item.flow === currentFlow()} onClick={() => handleClick(item.flow)} />}
                </For>
                <div class="menu-history">Histórico de chats - {getChatHistoryTitle()} </div>
                {/* <button>+Novo Chat</button> */}
                <div class="menu-history-item-wrapper">
                  <For each={Object.entries(groupedChatItems().groups)}>
                    {([key, items]) =>
                      (items as ChatItem[]).length > 0 && (
                        <div class="menu-history-item-group">
                          <span class="menu-history-date-label">{groupedChatItems().labels[key]}</span>
                          <For each={items as ChatItem[]}>
                            {(item) => {
                              let buttonRef: HTMLButtonElement | null = null;
                              return (
                                <div class="menu-history-item">
                                  {editingChatId() === item.id && isEditing() ? (
                                    <form onSubmit={(e) => handleEditSubmit(e, item.id)}>
                                      <input type="text" name="chatNameField" id={item.id} value={formatDateChat(item)} onInput={handleInputChange} />
                                    </form>
                                  ) : (
                                    <>
                                      <span>{formatDateChat(item)}</span>
                                      <button
                                        class="menu-history-button"
                                        ref={(element) => (buttonRef = element)}
                                        onClick={() => buttonRef && toggleMenuOptions(item.id, buttonRef)}
                                      >
                                        <DotsHorizontal />
                                      </button>
                                    </>
                                  )}
                                  {openMenuOptions() === item.id && (
                                    <div class={`menu-history-option ${modalPosition()}`}>
                                      <div class="menu-history-option-wrapper">
                                        <div class="menu-history-option-edit">
                                          <button onClick={() => startEditing(item.id)}>
                                            <PenEditIcon />
                                            Renomear chat
                                          </button>
                                        </div>
                                        <div class="menu-history-option-delete">
                                          <button onClick={() => handleOpenDeleteModal(item.id, formatDateChat(item))}>
                                            <TrashIcon color="#e41d1d" />
                                            Excluir chat
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          </For>
                        </div>
                      )
                    }
                  </For>
                </div>
              </div>
              <div class="menu-footer">
                <p>
                  Powered By <b>StartSe</b>
                </p>
              </div>
              <div class="menu-overlay" onClick={() => setOpen(false)} />
            </div>
          </div>
        ) : (
          <MenuButton fillColor={props.fillColor} onClick={() => setOpen(true)} />
        )}
      </div>
      <DeleteModal
        chatName={selectedChatName() || ''}
        isOpen={openDeleteModal()}
        onCancel={() => setIsOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
