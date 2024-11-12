import { Component } from 'solid-js';
import { RigthArrowIcon } from '@/components/icons/RigthArrowIcon';

export interface CardModelProps {
  flow: string;
  title: string;
  onClick?: () => void;
  bgImage: string;
  onFlowChange?: (flow: string) => void;
}

export const CardModel: Component<CardModelProps> = (props) => {
  const onClick = () => {
    if (props.onClick) {
      return props.onClick();
    }
    if (props.onFlowChange) {
      props.onFlowChange(props.flow);
    }
    window.location.href = `${props.flow}.html`;
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
