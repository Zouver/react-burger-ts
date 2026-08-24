import {
  Button,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useResetPasswordMutation } from '@services/api/stellarApi.ts';
import { isPasswordResetRequested } from '@services/auth/tokenStorage.ts';

import type { FormEvent } from 'react';

import styles from '../auth-pages.module.css';

export const ResetPasswordPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [resetPassword, { error, isLoading }] = useResetPasswordMutation();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const isResetRequested = isPasswordResetRequested();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      await resetPassword({ password, token }).unwrap();
      void navigate('/login', { replace: true });
    } catch (_error) {
      // RTK Query exposes the error via the mutation state for rendering.
    }
  };

  if (!isResetRequested) {
    return <Navigate replace to="/forgot-password" />;
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <h1 className="text text_type_main-medium mb-6">Восстановление пароля</h1>
        <PasswordInput
          extraClass="mb-6"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Введите новый пароль"
          value={password}
        />
        <Input
          extraClass="mb-6"
          name="token"
          onChange={(event) => setToken(event.target.value)}
          placeholder="Введите код из письма"
          value={token}
        />
        <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
          {isLoading ? 'Сохраняем...' : 'Сохранить'}
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
