import { Component } from 'solid-js';
import { RigthArrowIcon } from '@/components/icons/RigthArrowIcon';

export interface CardModelProps {
  id: string;
  title: string;
  onClick?: () => void;
  bgImage: string;
}

export const CardModel: Component<CardModelProps> = (props) => {
  const onClick = () => {
    if (props.onClick) {
      return props.onClick();
    }
    window.location.href = `${props.id}.html`;
  };

  return (
    <>
      <div class="card" style={`background-image: url(./flowise-embed/images/${props.bgImage})`}>
        <div class="card-footer">
          <p>{props.title}</p>
          <button onClick={onClick}>
            <RigthArrowIcon />
          </button>
        </div>
      </div>
    </>
  );
};
