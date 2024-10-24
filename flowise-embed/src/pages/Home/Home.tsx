import { For } from 'solid-js';
import styles from './styles/index.css';
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
          <For each={props.items}>{(item) => <CardModel {...item} onClick={() => (window.location.href = `${item.id}.html`)} />}</For>
        </div>
      </main>
      <footer>
        <span>
          Powered by
          <a href="https://startse.com" target="_blank">
            <span>&nbsp;StartSe</span>
          </a>
        </span>
        <img src="./flowise-embed/src/assets/logo.svg" alt="" />
      </footer>
    </>
  );
};
