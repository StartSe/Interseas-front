import { For, createEffect, createResource, createSignal } from 'solid-js';
import styles from '../../../assets/menu.css';
import { MenuButton } from './MenuButton';
import { MenuItem, MenuItemProps } from './MenuItem';
import { LogoInterseas } from '@/components/icons/LogoInterseas';
import { XIcon, DotsHorizontal, TrashIcon, PenEditIcon } from '@/components/icons';
import DocumentsDBService from '@/service/documentsDBService';

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
  const [openMenuOptions, setOpenMenuOptions] = createSignal<boolean>(false);
  const [openDeleteModal, setIsOpenDeleteModal] = createSignal<boolean>(false);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);
  const [currentFlow, setCurrentFLow] = createSignal(localStorage.getItem('currentFlow') || props.currentFlow);
  const [chatItems, setChatItems] = createSignal<ChatItem[]>([]);

  createEffect(async () => {
    const data = await documentService.getChatIdsByFlow(currentFlow());
    setChatItems(data);
  });
  const handleClick = (flow: string) => {
    setCurrentFLow(flow);
    localStorage.setItem('currentFlow', flow);
  };

  const toggleMenuOptions = () => {
    setOpenMenuOptions(!openMenuOptions());
  };

  const toggleEditMode = () => {
    setOpenMenuOptions(false);
    setIsEditing(!isEditing());
  };
  const handleDeleteClick = () => {
    setIsOpenDeleteModal(!openDeleteModal());
    setOpenMenuOptions(false);
  };
  const formatDateChat = (item: ChatItem) => {
    if (item.chat_name) {
      return item.chat_name;
    } else {
      const date = new Date(item.created_at);
      return `Sem título - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  };
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
                <div class="menu-history">Histórico de chats - Análise Crítica</div>
                {/* <button>+Novo Chat</button> */}
                <span class="menu-history-date-label">Hoje</span>
                <div class="menu-history-item-wrapper">
                  {!isEditing() ? (
                    <For each={chatItems()}>
                      {(item) => (
                        <div class="menu-history-item">
                          <span>{formatDateChat(item)}</span>
                          <button class="menu-history-button" onClick={() => toggleMenuOptions()}>
                            <DotsHorizontal />
                          </button>
                        </div>
                      )}
                    </For>
                  ) : (
                    <form
                      onSubmit={() => {
                        console.log('editou'), setIsEditing(false);
                      }}
                    >
                      <input type="text" name="chatNameField" id="chatName" />
                    </form>
                  )}
                  {openMenuOptions() && (
                    <div class="menu-history-option">
                      <div class="menu-history-option-wrapper">
                        <div class="menu-history-option-edit">
                          <button onClick={() => toggleEditMode()}>
                            <PenEditIcon />
                            Renomear chat
                          </button>
                        </div>
                        <div class="menu-history-option-delete">
                          <button onClick={() => handleDeleteClick()}>
                            <TrashIcon color="#E41D1D" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
      {openDeleteModal() ? (
        <div class="modal-delete">
          <div class="modal-delete-wrapper">
            <div class="modal-delete-content">
              <h6>Excluir Chat</h6>
              <span>Tem certeza que deseja excluir [nome do chat]? Essa é uma ação permanente</span>
              <div class="modal-delete-btn-wrapper">
                <button type="button" class="modal-delete-btn-cancel" onClick={() => setIsOpenDeleteModal(false)}>
                  cancelar
                </button>
                <button class="modal-delete-btn-delete">excluir</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
