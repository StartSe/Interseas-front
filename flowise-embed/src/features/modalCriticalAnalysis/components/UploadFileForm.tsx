import { ButtonInputTheme } from '@/features/bubbleCriticalAnalysis/types';
import { For, createSignal } from 'solid-js';
import { UploadFile, createFileUploader, createDropzone } from '@solid-primitives/upload';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { UploadFileItem } from '@/features/modal/components/UploadFileItem';
import { ConfirmUploadButton } from '@/components/inputs/button/ConfirmUploadButton';

type Props = {
  onSubmit: (files: UploadFile[]) => void;
  buttonInput?: ButtonInputTheme;
  uploadLabel?: string;
  modalTitle?: string;
  uploadingButtonLabel?: string;
  errorMessage?: string;
};

export const UploadFileForm = (props: Props) => {
  const [error, setError] = createSignal<UploadFile[]>([]);
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const acceptedFileTypes = { JPEG: 'image/jpeg', PNG: 'image/png', PDF: 'application/pdf' };

  const { selectFiles } = createFileUploader({
    accept: Object.keys(acceptedFileTypes).join(', '),
    multiple: true,
  });

  const { setRef: dropzoneRef } = createDropzone({
    onDrop: (files) => {
      addFile(files);
    },
  });

  const addFile = (uploadFiles: UploadFile[]) => {
    setFiles((prevState) => [...prevState, ...uploadFiles]);
    uploadFiles.forEach((item) => {
      if (isFileAccepted([item]) === false) {
        setError((prevState) => [...prevState, item]);
      }
    });
  };

  const removeFile = (fileIndex: number) => {
    setError((prevErrors) => prevErrors.filter((uploadFile) => uploadFile.source !== files()[fileIndex].source));
    setFiles((prevState) => prevState.filter((_, index) => index !== fileIndex));
  };

  const onSubmit = (event: MouseEvent) => {
    event.preventDefault();
    props.onSubmit(files());
  };

  const isFileAccepted = (item: UploadFile[]): boolean => {
    return item.some((file) => Object.values(acceptedFileTypes).includes(file.file.type));
  };

  return (
    <form class="flex flex-col justify-center items-center gap-8 form-container">
      <div class="flex flex-col justify-center items-center gap-6 form-container">
        <h2 class="modal-title">{props.modalTitle}</h2>
        <div ref={dropzoneRef} class="dropzone flex justify-center items-center">
          <div class="flex flex-col justify-center items-center ">
            <UploadIcon />
            <div>
              <h3>
                Arraste & solte arquivos ou{' '}
                <a
                  onClick={(event) => {
                    event.preventDefault();
                    selectFiles((files) => {
                      addFile(files);
                    });
                  }}
                >
                  Escolha
                </a>
              </h3>
              <p class="formacts">Formatos suportados: {Object.keys(acceptedFileTypes).join(', ')}</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col files">
          {files().length > 0 && <h4 class="upload-message">{props.uploadLabel}</h4>}
          <For each={files()}>
            {(item) => (
              <UploadFileItem
                file={item}
                index={files().indexOf(item)}
                removeFile={removeFile}
                error={isFileAccepted([item]) === false}
                errorMessage={props.errorMessage}
              />
            )}
          </For>
        </div>
      </div>

      <ConfirmUploadButton
        onSubmit={onSubmit}
        backgroundColor={props.buttonInput?.backgroundColor}
        textColor={props.buttonInput?.textColor}
        disabled={files().length === 0 || error().length > 0}
      >
        {props.uploadingButtonLabel}
      </ConfirmUploadButton>
    </form>
  );
};
