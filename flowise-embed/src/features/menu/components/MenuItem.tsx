export interface MenuItemProps {
  id: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const MenuItem = (props: MenuItemProps) => {
  return (
    <a href={`/${props.id}.html`} onClick={props.onClick}>
      <div class={`menu-item ${props.selected ? 'selected' : ''}`}>
        <p>
          <b>{props.title}</b>
        </p>
      </div>
    </a>
  );
};
