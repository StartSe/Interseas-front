import { DeleteFileIcon } from '@/components/icons/DeleteFileIcon';
import { DeleteIconBin } from '@/components/icons/DeleteIconBin';
import { UploadFile } from '@solid-primitives/upload';

type Props = {
  file: UploadFile;
  index: number;
  removeFile: (index: number) => void;
  error: boolean;
};

export const UploadFileItem = (props: Props) => {
  return (
    <>
      <div class={`flex items-center justify-between ${props.error ? 'upload-file-item-error' : 'upload-file-item'}`}>
        <p>{props.file.name}</p>
        <div onClick={() => props.removeFile(props.index)} style={{ cursor: 'pointer' }}>
          {props.error ? <DeleteFileIcon /> : <DeleteIconBin />}
        </div>
      </div>
      {props.error && <p class="upload-error-message">Este documento não é suportado. Por gentileza, exclua e carregue outro arquivo.</p>}
    </>
  );
};
