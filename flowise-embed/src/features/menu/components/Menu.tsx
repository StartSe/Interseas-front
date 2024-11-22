import { For, createEffect, createSignal } from 'solid-js';
import styles from '../../../assets/menu.css';
import { MenuButton } from './MenuButton';
import { MenuItem, MenuItemProps } from './MenuItem';
import { LogoInterseas } from '@/components/icons/LogoInterseas';
import { XIcon, DotsHorizontal, TrashIcon, PenEditIcon } from '@/components/icons';
import DocumentsDBService from '@/service/documentsDBService';
import DeleteModal from './DeleteModal';
import { group } from 'console';

const documentService = new DocumentsDBService();
export interface MenuProps {
  currentFlow: string;
  items: MenuItemProps[];
  fillColor?: string;
}
interface ChatItem {
  agentFlow: string;
  chatName: string | null;
  createdAt: string;
  id: string;
  updatedAt: string | null;
}
export const Menu = (props: MenuProps) => {
  const [open, setOpen] = createSignal(false);
  const [openDeleteModal, setIsOpenDeleteModal] = createSignal<boolean>(false);
  const [currentFlow, setCurrentFLow] = createSignal(localStorage.getItem('currentFlow') || props.currentFlow);
  const [groupedChatItems, setGroupedChatItems] = createSignal<object>({ groups: {} });
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
      const minSpaceForModal = 200;

      if (spaceBelow < minSpaceForModal && spaceAbove > minSpaceForModal) {
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
    const flowTitleMapping = {
      compliance: 'Análise de Compliance',
      critical_analysis: 'Análise Crítica',
    };
    try {
      return flowTitleMapping[currentFlow() as keyof typeof flowTitleMapping];
    } catch (error) {
      return '';
    }
  };

  const formatDateChat = (item: ChatItem) => {
    if (item.chatName) {
      return item.chatName;
    } else {
      const date = new Date(item.createdAt);
      return `Sem título - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  };

  const groupChatItemsByDate = (chatItems: ChatItem[]) => {
    const groups = [
      { label: 'Hoje', items: [] as ChatItem[], minDaysDiff: 0, maxDaysDiff: 0 },
      { label: 'Ontem', items: [] as ChatItem[], minDaysDiff: 1, maxDaysDiff: 1 },
      { label: 'Últimos 7 dias', items: [] as ChatItem[], minDaysDiff: 2, maxDaysDiff: 7 },
      { label: 'Últimos 30 dias', items: [] as ChatItem[], minDaysDiff: 8, maxDaysDiff: 30 },
      { label: 'Mais antigos', items: [] as ChatItem[], minDaysDiff: 31, maxDaysDiff: null },
    ];

    function adjustDateToBrazilianTime(date: Date): Date {
      const brazilTimezoneOffset = -180;
      const milisecondsInAMinute = 60000;
      const localTimezoneOffset = date.getTimezoneOffset();
      const offsetDifference = brazilTimezoneOffset - localTimezoneOffset;
      return new Date(date.getTime() + offsetDifference * milisecondsInAMinute);
    }

    // Sort chatItems by created_at in descending order
    chatItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let currentGroupIndex = 0;

    chatItems.forEach((item) => {
      const milisecondsInASecond = 1000;
      const hoursInADay = 24;
      const secondsInMinutes = 60;
      const date = adjustDateToBrazilianTime(new Date(item.createdAt));
      const now = adjustDateToBrazilianTime(new Date());

      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = Math.abs(nowOnly.getTime() - dateOnly.getTime());
      const diffDays = Math.ceil(diffTime / (milisecondsInASecond * secondsInMinutes * secondsInMinutes * hoursInADay));

      for (let groupIndex = currentGroupIndex; groupIndex < groups.length; groupIndex++) {
        const currentGroup = groups[groupIndex];
        if (
          (currentGroup.minDaysDiff === null || diffDays >= currentGroup.minDaysDiff) &&
          (currentGroup.maxDaysDiff === null || diffDays <= currentGroup.maxDaysDiff)
        ) {
          currentGroup.items.push(item);
          return;
        }
        currentGroupIndex++;
      }
    });
    return groups;
  };

  const fetchChatIds = async () => {
    const data = await documentService.getChatIdsByFlow(currentFlow());
    if (data && Array.isArray(data)) {
      const formatCamelCaseData = data.map((item) => ({
        agentFlow: item.agent_flow,
        chatName: item.chat_name,
        createdAt: item.created_at,
        id: item.id,
        updatedAt: item.updated_at,
      }));
      setGroupedChatItems(groupChatItemsByDate(formatCamelCaseData as ChatItem[]));
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
                <div class="menu-history-item-wrapper">
                  <For each={Object.values(groupedChatItems())}>
                    {(group) =>
                      group.items.length > 0 && (
                        <div class={`menu-history-item-group ${group.items.length < 5 ? 'min-height' : ''}`}>
                          <span class="menu-history-date-label">{group.label}</span>
                          <For each={group.items}>
                            {(item) => {
                              let buttonRef: HTMLButtonElement | null = null;
                              return (
                                <div class="menu-history-item">
                                  {editingChatId() === item.id && isEditing() ? (
                                    <form onSubmit={(e) => handleEditSubmit(e, item.id)}>
                                      <input type="text" name="chat-name" id={item.id} value={formatDateChat(item)} onInput={handleInputChange} />
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
