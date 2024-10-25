import { For } from 'solid-js';
import styles from './home.css';
import { CardModel, CardModelProps } from './components/CardModel';

export interface HomeProps {
  items: CardModelProps[];
}

export const Home = (props: HomeProps) => {
  return (
    <>
      <style>{styles}</style>
      <main>
        <div class="text-box">
          <h1>Boas-vindas ao Comex AI!</h1>
          <p>Escolha qual tarefa deseja realizar abaixo</p>
        </div>
        <div class="card-container">
          <For each={props.items}>{(item) => <CardModel {...item} />}</For>
        </div>
      </main>
      <footer>
        <span>
          Powered by
          <a href="https://startse.com" target="_blank">
            &nbsp;StartSe
          </a>
        </span>
        <img src="./flowise-embed/src/assets/logo.svg" alt="" />
      </footer>
    </>
  );
};
