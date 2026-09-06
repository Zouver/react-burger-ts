import { Button, EmailInput } from '@krgaa/react-developer-burger-ui-components';
import { Link, useNavigate } from 'react-router-dom';

import { useForm } from '@hooks/use-form.ts';
import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useForgotPasswordMutation } from '@services/api/stellarApi.ts';

import type { FormEvent } from 'react';

import styles from '../auth-pages.module.css';

export const ForgotPasswordPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [forgotPassword, { error, isLoading }] = useForgotPasswordMutation();
  const { handleChange, values } = useForm({ email: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      await forgotPassword(values.email).unwrap();
      void navigate('/reset-password');
    } catch (_error) {
      // RTK Query exposes the error via the mutation state for rendering.
    }
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <h1 className="text text_type_main-medium mb-6">Восстановление пароля</h1>
        <EmailInput
          extraClass="mb-6"
          name="email"
          onChange={handleChange}
          placeholder="Укажите e-mail"
          value={values.email}
        />
        <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
          {isLoading ? 'Отправляем...' : 'Восстановить'}
        </Button>
        <p className={`${styles.error} text text_type_main-default mt-6 mb-20`}>
          {getErrorMessage(error, '')}
        </p>
        <p className="text text_type_main-default text_color_inactive">
          Вспомнили пароль?{' '}
          <Link className={styles.link} to="/login">
            Войти
          </Link>
        </p>
      </form>
    </main>
  );
};
