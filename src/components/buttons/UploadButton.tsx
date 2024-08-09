import { JSX } from 'solid-js/jsx-runtime';

type UploadButtonProps = {
  buttonColor?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  text?: string;
  onClick?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtomUpload = (props: UploadButtonProps) => {
  return (
    <div class={'flex w-full justify-center'}>
      <button
        onClick={() => props.onClick?.()}
        type="submit"
        disabled={props.isDisabled || props.isLoading}
        {...props}
        class={
          'py-4 px-12 font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 ' +
          props.class
        }
        style={{ background: '#002F6C', border: 'none', color: '#ffffff' }}
      >
        {props.text ? props.text : ''}
      </button>
    </div>
  );
};
