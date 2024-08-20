import { DeleteFileIcon } from '@/components/icons/DeleteFileIcon';
import { DeleteIconBin } from '@/components/icons/DeleteIconBin';
import { UploadFile } from '@solid-primitives/upload';

type Props = {
  file: UploadFile;
  index: number;
  removeFile: (index: number) => void;
  error: boolean;
  errorMessage?: string;
};

export const UploadFileItem = (props: Props) => {
  return (
    <>
      <div class={`flex items-center justify-between upload-file-item${props.error ? '-error' : ''}`}>
        <p>{props.file.name}</p>
        <div onClick={() => props.removeFile(props.index)} style={{ cursor: 'pointer' }}>
          {props.error ? <DeleteFileIcon /> : <DeleteIconBin />}
        </div>
      </div>
      {props.error && <p class="upload-error-message">{props.errorMessage}</p>}
    </>
  );
};
