import { Component } from 'solid-js';
// import styles from '../styles/index.css';
import { RigthArrowIcon } from '@/components/icons/RigthArrowIcon';

export interface CardModelProps {
  id: string;
  title: string;
  onClick: () => void;
  typeCard: string;
}

export const CardModel: Component<CardModelProps> = (props) => {
  return (
    <>
      {/* <style>{styles}</style> */}
      <div class={'card ' + `${props.typeCard}`}>
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
