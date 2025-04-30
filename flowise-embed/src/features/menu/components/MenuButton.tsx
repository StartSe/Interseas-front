import { MenuIcon } from '@/components/icons/MenuIcon';
interface MenuButtonProps {
  onClick?: () => void;
  fillColor?: string;
}
export const MenuButton = (props: MenuButtonProps) => {
  return (
    <button class="menu-opener-button" onClick={() => props.onClick && props.onClick()}>
      <MenuIcon fillColor={props.fillColor} />
    </button>
  );
};
