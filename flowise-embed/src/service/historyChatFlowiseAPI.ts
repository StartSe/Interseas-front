import { ChatMessage } from '@/types';


export class historyChatFlowiseAPI {

		private async getChatHistory(apiHost: string, chatFlowId:string, chatHistoryId: string) {
				const response = await fetch(`${apiHost}/chatmessage/${chatFlowId}?chatId=${chatHistoryId}`, {
						method: 'GET',
						headers: {
								'Authorization': `${this.jwtTOKEN}`,
						},
				});
				const chatData: ChatMessage[] = await response.json();

				return chatData;
		}

		public async getChatHistoryByChatId(apiHost:string, chatFlowId: string, chatId: string): Promise<any> {
				return this.getChatHistory(apiHost, chatFlowId, chatId);
		}
}
export default historyChatFlowiseAPI;





