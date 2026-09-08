import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { ModalOverlay } from '@components/modal-overlay/modal-overlay';

import styles from './modal.module.css';

type TModalProps = {
  ariaLabel?: string;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const modalRoot = document.body;

export const Modal = ({
  ariaLabel,
  title,
  children,
  onClose,
}: TModalProps): React.JSX.Element => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const handleEscClose = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleEscClose);

    return (): void => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscClose);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [handleEscClose]);

  return createPortal(
    <div className={styles.wrapper} role="presentation">
      <ModalOverlay onClick={onClose} />
      <section
        aria-label={ariaLabel ?? title ?? 'Модальное окно'}
        aria-modal="true"
        className={`${styles.modal} pt-10 pr-10 pb-15 pl-10`}
        ref={modalRef}
        role="dialog"
      >
        <header className={styles.header}>
          {title ? <h2 className="text text_type_main-large">{title}</h2> : <span />}
          <button
            aria-label="Закрыть"
            className={styles.close}
            onClick={onClose}
            ref={closeButtonRef}
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
