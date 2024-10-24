import { Component } from 'solid-js';
import { RigthArrowIcon } from '@/components/icons/RigthArrowIcon';

export interface CardModelProps {
  id: string;
  title: string;
  onClick: () => void;
  typeCard: string;
  bgCard: string;
}

export const CardModel: Component<CardModelProps> = (props) => {
  return (
    <>
      <div class="card" style={'background-image: url(./flowise-embed/images/' + `${props.bgCard}` + ')'}>
        <div class="card-footer">
          <p>{props.title}</p>
          <button onClick={() => props.onClick()}>
            <RigthArrowIcon />
          </button>
        </div>
      </div>
    </>
  );
};
