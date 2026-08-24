import {
  Button,
  EmailInput,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useLoginMutation } from '@services/api/stellarApi.ts';

import type { FormEvent } from 'react';
import type { Location } from 'react-router-dom';

import styles from '../auth-pages.module.css';

type TLocationState = {
  from?: Location;
};

export const LoginPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { error, isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      await login({ email, password }).unwrap();

      const state = location.state as TLocationState | null;

      void navigate(state?.from?.pathname ?? '/', { replace: true });
    } catch (_error) {
      // RTK Query exposes the error via the mutation state for rendering.
    }
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <h1 className="text text_type_main-medium mb-6">Вход</h1>
        <EmailInput
          extraClass="mb-6"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail"
          value={email}
        />
        <PasswordInput
          extraClass="mb-6"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          value={password}
        />
        <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
          {isLoading ? 'Входим...' : 'Войти'}
        </Button>
        <p className={`${styles.error} text text_type_main-default mt-6 mb-20`}>
          {getErrorMessage(error, '')}
        </p>
        <ul className={styles.links}>
          <li className="text text_type_main-default text_color_inactive">
            Вы новый пользователь?{' '}
            <Link className={styles.link} to="/register">
              Зарегистрироваться
            </Link>
          </li>
          <li className="text text_type_main-default text_color_inactive">
            Забыли пароль?{' '}
            <Link className={styles.link} to="/forgot-password">
              Восстановить пароль
            </Link>
          </li>
        </ul>
      </form>
    </main>
  );
};
