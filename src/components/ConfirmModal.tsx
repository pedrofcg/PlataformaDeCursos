import { Modal, Button } from 'react-bootstrap';

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  show,
  title = 'Confirmar Exclusão',
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-secondary-custom" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="btn-danger-custom" onClick={onConfirm}>
          Excluir
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
