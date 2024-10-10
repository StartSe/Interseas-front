import { TypingBubble } from '@/components/TypingBubble';
import { UploadingBubble } from '@/components/UploadingBubble';
import { Avatar } from '../avatars/Avatar';

export const LoadingBubble = (props: { typeLoading: string }) => {
  return (
    <div class="flex flex-row justify-start mb-2 items-start host-container" style={{ 'margin-right': '50px' }}>
      <Avatar />
      <div class=" flex justify-start mb-2 items-center animate-fade-in host-container">
        <span class="px-4 py-4 ml-2 whitespace-pre-wrap max-w-full chatbot-host-bubble" data-testid="host-bubble">
          {props.typeLoading === 'upload' ? <UploadingBubble /> : <TypingBubble />}
        </span>
      </div>
    </div>
  );
};
