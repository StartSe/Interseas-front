import { Show } from 'solid-js';
import { messageUtils } from '../../../utils/messageUtils';

type DeleteModalProps = {
  chatName: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (chatId: string) => void;
};

const DeleteModal = (props: DeleteModalProps) => {
  return (
    <Show when={props.isOpen}>
      <div class="modal-delete">
        <div class="modal-delete-wrapper">
          <div class="modal-delete-content">
            <h6>Excluir Chat</h6>
            <span>{messageUtils.DELETE_CONFIRMATION(props.chatName)}</span>
            <div class="modal-delete-btn-wrapper">
              <button type="button" class="modal-delete-btn-cancel" onClick={() => props.onCancel()}>
                {messageUtils.CANCEL_BUTTON}
              </button>
              <button class="modal-delete-btn-delete" onClick={() => props.onConfirm(props.chatName)}>
                {messageUtils.DELETE_BUTTON}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default DeleteModal;
