import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { Link } from 'react-router-dom';

import { useForm } from '@hooks/use-form.ts';
import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useRegisterMutation } from '@services/api/stellarApi.ts';

import type { FormEvent } from 'react';

import styles from '../auth-pages.module.css';

export const RegisterPage = (): React.JSX.Element => {
  const [register, { error, isLoading }] = useRegisterMutation();
  const { handleChange, values } = useForm({
    email: '',
    name: '',
    password: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      await register(values).unwrap();
    } catch (_error) {
      // RTK Query exposes the error via the mutation state for rendering.
    }
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <h1 className="text text_type_main-medium mb-6">Регистрация</h1>
        <Input
          extraClass="mb-6"
          name="name"
          onChange={handleChange}
          placeholder="Имя"
          value={values.name}
        />
        <EmailInput
          extraClass="mb-6"
          name="email"
          onChange={handleChange}
          placeholder="E-mail"
          value={values.email}
        />
        <PasswordInput
          extraClass="mb-6"
          name="password"
          onChange={handleChange}
          placeholder="Пароль"
          value={values.password}
        />
        <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
          {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </Button>
        <p className={`${styles.error} text text_type_main-default mt-6 mb-20`}>
          {getErrorMessage(error, '')}
        </p>
        <ul className={styles.links}>
          <li className="text text_type_main-default text_color_inactive">
            Уже зарегистрированы?{' '}
            <Link className={styles.link} to="/login">
              Войти
            </Link>
          </li>
        </ul>
      </form>
    </main>
  );
};
