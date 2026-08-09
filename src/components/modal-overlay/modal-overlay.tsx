import styles from './modal-overlay.module.css';

type TModalOverlayProps = {
  onClick: () => void;
};

export const ModalOverlay = ({ onClick }: TModalOverlayProps): React.JSX.Element => {
  return (
    <button
      aria-label="Закрыть модальное окно"
      className={styles.overlay}
      onClick={onClick}
      type="button"
    />
  );
};
