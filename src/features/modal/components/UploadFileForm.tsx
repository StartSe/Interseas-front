import { Button } from '@/components/inputs/button';
import { ButtonInputTheme } from '@/features/bubble/types';
import { For, createSignal } from 'solid-js';
import { UploadFile, createFileUploader, createDropzone } from '@solid-primitives/upload';
import { UploadIcon } from '@/components/icons/UploadIcon';
import { UploadFileItem } from './UploadFileItem';

type Props = {
  onSubmit: (files: UploadFile[]) => void;
  buttonInput?: ButtonInputTheme;
};

export const UploadFileForm = (props: Props) => {
  const [error, setError] = createSignal<UploadFile[]>([]);
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const acceptedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  const { selectFiles, clearFiles: selectClearFiles } = createFileUploader({
    accept: acceptedFileTypes.join(','),
  });

  const { setRef: dropzoneRef, clearFiles: dropzoneClearFiles } = createDropzone({
    onDrop: (files) => {
      adicionarItem(files);
    },
  });

  const adicionarItem = (file: UploadFile[]) => {
    setFiles((prevState) => [...prevState, ...file]);
    if (hasSpecificClass(file)) {
      setError((prevState) => [...prevState, ...file]);
    }
  };

  const clearFiles = () => {
    selectClearFiles();
    dropzoneClearFiles();
    setFiles([]);
  };

  const removerItem = (archivePosition: number) => {
    setError((prevErrors) => prevErrors.filter((uploadFile) => uploadFile.source !== files()[archivePosition].source));
    setFiles((prevState) => prevState.filter((_, index) => index !== archivePosition));
  };

  const onSubmit = (event: MouseEvent) => {
    event.preventDefault();
    props.onSubmit(files());
  };

  const hasSpecificClass = (item: UploadFile[]): boolean => {
    const hasIncompatibleFile = item.some((file) => !acceptedFileTypes.includes(file.file.type));
    return hasIncompatibleFile;
  };

  return (
    <form class="flex flex-col justify-center items-center gap-8 form-container">
      <div class="flex flex-col justify-center items-center gap-6 form-container">
        <h2 class="modal-title">Faça o upload dos seus documentos</h2>
        <div ref={dropzoneRef} class="dropzone flex  justify-center items-center">
          <div class="flex flex-col justify-center items-center ">
            <UploadIcon />
            <div>
              <h3>
                Arraste & solte arquivos ou{' '}
                <a
                  onClick={(event) => {
                    event.preventDefault();
                    selectFiles((files) => {
                      adicionarItem(files);
                    });
                  }}
                >
                  Escolha
                </a>
              </h3>
              <p class="formacts">Formatos suportados: JPEG, PNG, PDF</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col archives">
          {files().length > 0 && <h4 class="upload-message">Fazendo upload do documento</h4>}
          <For each={files()}>
            {(item) => (
              <UploadFileItem
                file={item}
                onDelete={clearFiles}
                index={files().indexOf(item)}
                removeritem={removerItem}
                error={hasSpecificClass([item])}
                item={item.file.type}
              />
            )}
          </For>
        </div>
      </div>

      <Button
        onSubmit={onSubmit}
        backgroundColor={props.buttonInput?.backgroundColor}
        textColor={props.buttonInput?.textColor}
        disabled={files().length === 0 || error().length > 0}
      >
        CONFIRMAR ENVIO
      </Button>
    </form>
  );
};
