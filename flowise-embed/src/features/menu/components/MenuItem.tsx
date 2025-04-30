export interface MenuItemProps {
  flow: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const MenuItem = (props: MenuItemProps) => {
  return (
    <a href={`./${props.flow}.html`} onClick={props.onClick}>
      <div class={`menu-item ${props.selected ? 'selected' : ''}`}>
        <p>
          <b>{props.title}</b>
        </p>
      </div>
    </a>
  );
};
