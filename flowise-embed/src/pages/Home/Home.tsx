import styles from '../styles/index.css';
import { CardModel } from './components/CardModel';

export const Home = () => {
  return (
    <>
      {/* <style>{styles}</style> */}
      <main>
        <div class="text-box">
          <h1>Boas-vindas aao Comex AI!</h1>
          <p>Escolha qual tarefa deseja realizar abaixo</p>
        </div>
        <div class="card-container">
          <CardModel typeCard="card-critical" title="Análise Crítica" onClick={() => (window.location.href = 'critical_analysis.html')} />
          <CardModel typeCard="card-compliance" title="Análise de Compliance" onClick={() => (window.location.href = 'compliance.html')} />
          <CardModel typeCard="card-estimativa" title="Análise de Estimativa" onClick={() => (window.location.href = 'index.html')} />
        </div>
      </main>
    </>
  );
};
