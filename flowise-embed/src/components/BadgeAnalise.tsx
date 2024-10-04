import { FooterTheme } from '@/features/bubbleCriticalAnalysis/types';
import { Show, onCleanup, onMount } from 'solid-js';

type Props = {
  footer?: FooterTheme;
  botContainer: HTMLDivElement | undefined;
  poweredByTextColor?: string;
  badgeBackgroundColor?: string;
};

const defaultTextColor = '#303235';

export const Badge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined;
  let observer: MutationObserver | undefined;

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if ('id' in removedNode && liteBadge && removedNode.id == 'lite-badge') {
          console.log("Sorry, you can't remove the brand 😅");
          props.botContainer?.append(liteBadge);
        }
      });
    });
  };

  onMount(() => {
    if (!document || !props.botContainer) return;
    observer = new MutationObserver(appendBadgeIfNecessary);
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    });
  });

  onCleanup(() => {
    if (observer) observer.disconnect();
  });

  return (
    <>
      <Show when={props.footer?.showFooter === undefined || props.footer?.showFooter === null || props.footer?.showFooter === true}>
        <div
          style={{
            display: 'flex',
            'flex-direction': 'row',
            'justify-content': 'center',
            'align-items': 'center',
            padding: '0 12px',
          }}
        >
          <span
            class="w-full px-[10px] pt-[6px] pb-[10px] m-auto text-[13px]"
            style={{
              color: props.footer?.textColor ?? props.poweredByTextColor ?? defaultTextColor,
              'background-color': props.badgeBackgroundColor ?? '#ffffff',
            }}
          >
            {props.footer?.text ?? 'Powered by'}
            <a
              ref={liteBadge}
              href={props.footer?.companyLink ?? 'https://startse.com'}
              target="_blank"
              rel="noopener noreferrer"
              class="lite-badge"
              id="lite-badge"
              style={{ 'font-weight': 'bold', color: props.footer?.textColor ?? props.poweredByTextColor ?? defaultTextColor }}
            >
              <span>&nbsp;{props.footer?.company ?? 'StartSe'}</span>
            </a>
          </span>
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="0.64502" width="100" height="19.3548" fill="url(#pattern0_6660_1815)" />
            <defs>
              <pattern id="pattern0_6660_1815" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use href="#image0_6660_1815" transform="scale(0.00230415 0.0119048)" />
              </pattern>
              <image
                id="image0_6660_1815"
                width="434"
                height="84"
                href="data:image/png;base64,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"
              />
            </defs>
          </svg>
        </div>
      </Show>
      <Show when={props.footer?.showFooter === false}>
        <span
          class="w-full text-center px-[10px] pt-[6px] pb-[10px] m-auto text-[13px]"
          style={{
            color: props.footer?.textColor ?? props.poweredByTextColor ?? defaultTextColor,
            'background-color': props.badgeBackgroundColor ?? '#ffffff',
          }}
        />
      </Show>
    </>
  );
};
