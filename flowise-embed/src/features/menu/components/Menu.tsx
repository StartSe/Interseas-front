import { For, createSignal } from 'solid-js';
import styles from '../../../assets/menu.css';
import { MenuButton } from './MenuButton';
import { MenuItem, MenuItemProps } from './MenuItem';
import { LogoInterseas } from '@/components/icons/LogoInterseas';
import { XIcon, DotsHorizontal } from '@/components/icons';
import DocumentsDBService from '@/service/documentsDBService';

const documentService = new DocumentsDBService();
export interface MenuProps {
  currentFlow: string;
  items: MenuItemProps[];
  fillColor?: string;
}
export const Menu = (props: MenuProps) => {
  const [open, setOpen] = createSignal(false);
  const [currentFlow, setCurrentFLow] = createSignal(localStorage.getItem('currentFlow') || props.currentFlow);

  const handleClick = (flow: string) => {
    setCurrentFLow(flow);
    localStorage.setItem('currentFlow', flow);
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
                  <span>Título da conversa 1</span>
                  <button class="menu-history-button">
                    <DotsHorizontal />
                  </button>
                </div>
              </div>
              <div class="menu-footer">
                <p>
                  Powered By <b>StartSe</b>
                </p>
              </div>
            </div>
            <div class="menu-overlay" onClick={() => setOpen(false)} />
          </div>
        ) : (
          <MenuButton fillColor={props.fillColor} onClick={() => setOpen(true)} />
        )}
      </div>
    </>
  );
};
