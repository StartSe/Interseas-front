import { Show } from 'solid-js';

type DeleteModalProps = {
  chatName: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const DeleteModal = (props: DeleteModalProps) => {
  return (
    <Show when={props.isOpen}>
      <div class="modal-delete">
        <div class="modal-delete-wrapper">
          <div class="modal-delete-content">
            <h6>Excluir Chat</h6>
            <span>Tem certeza que deseja excluir {props.chatName}? Essa é uma ação permanente</span>
            <div class="modal-delete-btn-wrapper">
              <button type="button" class="modal-delete-btn-cancel" onClick={() => props.onCancel()}>
                cancelar
              </button>
              <button class="modal-delete-btn-delete" onClick={() => props.onConfirm()}>
                excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default DeleteModal;
