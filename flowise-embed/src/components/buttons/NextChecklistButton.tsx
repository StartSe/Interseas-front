import { JSX } from 'solid-js/jsx-runtime';

type UploadButtonProps = {
  buttonColor?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  text?: string | '';
  backgroundColor?: string;
  border?: string;
  color?: string;
  onClick?: () => void;
  checklistNumber?: number;
  currentChecklistNumber?: number;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const NextChecklistButton = (props: UploadButtonProps) => {
  const DefaultButtonValues = {
    backgroundColor: '#ffffff',
    border: '2px solid #002F6C',
    color: '#002F6C',
    text: '',
  };
  return (
    <div class={'flex w-full justify-center mb-5'}>
      <button
        onClick={() => props.onClick?.()}
        type="submit"
        disabled={props.isDisabled || props.isLoading}
        {...props}
        class={
          'py-4 px-12 font-semibold uppercase focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 ' +
          props.class
        }
        style={{
          background: props.backgroundColor ?? DefaultButtonValues.backgroundColor,
          border: props.border ?? DefaultButtonValues.border,
          color: props.color ?? DefaultButtonValues.color,
        }}
      >
        {props.text}
        {props.checklistNumber && props.currentChecklistNumber && (
          <>
            {' '}
            ({props.currentChecklistNumber}/{props.checklistNumber})
          </>
        )}
      </button>
    </div>
  );
};
