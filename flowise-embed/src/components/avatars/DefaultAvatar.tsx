import { isMobile } from '@/utils/isMobileSignal';

export const DefaultAvatar = () => {
  return (
    <figure
      class={
        'flex justify-center items-center rounded-full text-white relative flex-shrink-0 ' + (isMobile() ? 'w-6 h-6 text-sm' : 'w-10 h-10 text-xl')
      }
      data-testid="default-avatar"
    >
      <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" width="32" height="32" rx="16" fill="#002F6C" />
        <rect x="6.5" y="7" width="20" height="18.9286" fill="url(#pattern0_6413_400)" />
        <defs>
          <pattern id="pattern0_6413_400" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use href="#image0_6413_400" transform="matrix(0.0181052 0 0 0.0188679 -0.160714 -0.132075)" />
          </pattern>
          <image
            id="image0_6413_400"
            width="250"
            height="73"
            href="data:image/png;base64,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"
          />
        </defs>
      </svg>
    </figure>
  );
};
