import { registerWebComponents, nameURL } from './register';
import { parseChatbot, injectChatbotInWindow } from './window';
import { parseChatbotAnalise, injectChatbotInWindowAnalise } from './windowCriticalAnalysis';

registerWebComponents();

const chatbot = nameURL.includes('analise_critica.html') ? parseChatbotAnalise() : parseChatbot();

if (nameURL.includes('analise_critica.html')) {
  injectChatbotInWindowAnalise(chatbot);
}
if (nameURL.includes('index.html')) {
  injectChatbotInWindow(chatbot);
}

export default chatbot;
