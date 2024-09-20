import { customElement } from 'solid-element';
import { defaultBotProps, defaultBotPropsAnalise } from './constants';
import { Bubble } from './features/bubble';
import { BubbleAnalise } from './features/bubbleCriticalAnalysis';
import { Full } from './features/full';
import { FullCriticalAnalysis } from './features/fullCriticalAnalysis';

export const registerWebComponents = () => {
  if (typeof window === 'undefined') return;
  const url = window.location.href;

  if (url.includes('index.html')) {
    customElement('flowise-fullchatbot', defaultBotProps, Full as any);
    customElement('flowise-chatbot', defaultBotProps, Bubble);
  }
  if (url.includes('analise_critica.html')) {
    customElement('analise-fullchatbot', defaultBotPropsAnalise, FullCriticalAnalysis as any);
    customElement('analise-chatbot', defaultBotPropsAnalise, BubbleAnalise);
  }
};

export const nameURL = window.location.href;
