/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ParentProps } from 'solid-js';
import { UploadFileForm } from '@/features/modal/components/UploadFileForm';
import { UploadFile } from '@solid-primitives/upload';
import { ButtonInputTheme } from '@/features/bubble/types';

type Props = ParentProps & {
  isOpen: boolean;
  onClose: () => void;
  onUploadSubmit: (files: UploadFile[]) => void;
  buttonInput?: ButtonInputTheme;
  modalTitle?: string;
  uploadLabel?: string;
  uploadingButtonLabel?: string;
  errorMessage?: string;
};

export const FileUploadModal = (props: Props) => {
  let ref: HTMLDivElement;

  const handleClick = (event: MouseEvent) => {
    if (!ref.contains(event.target as Node)) {
      props.onClose();
    }
  };

  return (
    <>
      {props.isOpen ? (
        <div class="modal-backdrop " onClick={handleClick}>
          <div ref={ref!} class="fixed modal">
            <UploadFileForm
              onSubmit={props.onUploadSubmit}
              buttonInput={props.buttonInput}
              modalTitle={props.modalTitle}
              uploadLabel={props.uploadLabel}
              uploadingButtonLabel={props.uploadingButtonLabel}
              errorMessage={props.errorMessage}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
