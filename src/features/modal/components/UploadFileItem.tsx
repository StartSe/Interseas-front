import { DeleteFileIcon } from '@/components/icons/DeleteFileIcon';
import { DeleteIconBin } from '@/components/icons/DeleteIconBin';
import { UploadFile } from '@solid-primitives/upload';
import { createEffect } from 'solid-js';

type Props = {
  file: UploadFile;
  onDelete: () => void;
  index: number;
  removeritem: (index: number) => void;
  error: boolean;
  item: string;
};

export const UploadFileItem = (props: Props) => {
  createEffect(() => {
    console.log(props.item);
  });
  return (
    <>
      <div class={`flex items-center justify-between ${props.error ? 'upload-file-item-error' : 'upload-file-item'}`}>
        <p>{props.file.name}</p>
        <div onClick={() => props.removeritem(props.index)} style={{ cursor: 'pointer' }}>
          {props.error ? <DeleteFileIcon /> : <DeleteIconBin />}
        </div>
      </div>
      {props.error && <p class="upload-error-message">Este documento não é suportado. Por gentileza, exclua e carregue outro arquivo.</p>}
    </>
  );
};
