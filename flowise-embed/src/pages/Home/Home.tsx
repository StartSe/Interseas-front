import { For, createSignal } from 'solid-js';
import styles from './home.css';
import { CardModel, CardModelProps } from './components/CardModel';
import DocumentsDBService from '@/service/documentsDBService';

const documentService = new DocumentsDBService();
export interface HomeProps {
  items: CardModelProps[];
}

export const Home = (props: HomeProps) => {
  const [currentId, setCurrentId] = createSignal('initialId');

  const handleCardClick = (id: string) => {
    setCurrentId(id);
    localStorage.setItem('currentId', id);
    documentService.getChatIdsByFlow(id);
  };

  return (
    <>
      <style>{styles}</style>
      <main>
        <div class="text-box">
          <h1>Boas-vindas ao Comex AI!</h1>
          <p>Escolha qual tarefa deseja realizar abaixo</p>
        </div>
        <div class="card-container">
          <For each={props.items}>{(item) => <CardModel {...item} onIdChange={handleCardClick} />}</For>
        </div>
      </main>
      <footer>
        <span class="footer-container">
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
