import { For, createSignal } from 'solid-js';
import styles from '../../../assets/menu.css';
import { MenuButton } from './MenuButton';
import { MenuItem, MenuItemProps } from './MenuItem';
import { LogoInterseas } from '@/components/icons/LogoInterseas';
import { XIcon } from '@/components/icons/XIcon';
export interface MenuProps {
  currentId: string;
  items: MenuItemProps[];
}
export const Menu = (props: MenuProps) => {
  const [open, setOpen] = createSignal(false);
  const [currentId, setCurrentId] = createSignal(localStorage.getItem('currentId') || props.currentId);

  const handleClick = (id: string) => {
    setCurrentId(id);
    localStorage.setItem('currentId', id);
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
                  {(item) => <MenuItem {...item} selected={item.id === currentId()} onClick={() => handleClick(item.id)} />}
                </For>
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
          <MenuButton onClick={() => setOpen(true)} />
        )}
      </div>
    </>
  );
};
