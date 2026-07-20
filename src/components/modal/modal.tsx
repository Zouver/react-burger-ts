import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { ModalOverlay } from '@components/modal-overlay/modal-overlay';

import styles from './modal.module.css';

type TModalProps = {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const modalRoot = document.body;

export const Modal = ({ title, children, onClose }: TModalProps): React.JSX.Element => {
  const handleEscClose = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscClose);

    return (): void => {
      document.removeEventListener('keydown', handleEscClose);
    };
  }, [handleEscClose]);

  return createPortal(
    <div className={styles.wrapper} role="presentation">
      <ModalOverlay onClick={onClose} />
      <section
        aria-modal="true"
        className={`${styles.modal} pt-10 pr-10 pb-15 pl-10`}
        role="dialog"
      >
        <header className={styles.header}>
          {title ? <h2 className="text text_type_main-large">{title}</h2> : <span />}
          <button
            aria-label="Закрыть"
            className={styles.close}
            onClick={onClose}
            type="button"
          >
            <CloseIcon type="primary" />
          </button>
        </header>
        {children}
      </section>
    </div>,
    modalRoot
  );
};
