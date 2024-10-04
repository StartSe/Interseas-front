import { TypingBubble } from '@/components/TypingBubble';
import { Avatar } from '../avatars/Avatar';

export const LoadingBubble = () => (
  <div class="flex flex-row justify-start mb-2 items-start host-container" style={{ 'margin-right': '50px' }}>
    <Avatar />
    <div
      style={{
        'margin-left': '0.5rem',
        padding: '1rem',
        display: 'flex',
        'flex-direction': 'column',
        background: '#F7F8FF',
        'text-align': 'center',
        'border-radius': '0.375rem',
      }}
      class="flex justify-start mb-2 items-center animate-fade-in host-container"
    >
      <span class="px-4 py-4 ml-2 whitespace-pre-wrap max-w-full" data-testid="host-bubble">
        <TypingBubble />
      </span>
    </div>
  </div>
);
