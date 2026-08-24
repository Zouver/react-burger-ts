import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect, useState } from 'react';

import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useUpdateUserMutation } from '@services/api/stellarApi.ts';
import { selectUser } from '@services/auth/authSlice.ts';
import { useAppSelector } from '@services/hooks.ts';

import type { FormEvent } from 'react';

import styles from './profile-form.module.css';

export const ProfileForm = (): React.JSX.Element => {
  const user = useAppSelector(selectUser);
  const [updateUser, { error, isLoading }] = useUpdateUserMutation();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
  }, [user]);

  const isChanged =
    name !== (user?.name ?? '') || email !== (user?.email ?? '') || password !== '';

  const handleCancel = (): void => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!isChanged || isLoading) {
      return;
    }

    try {
      await updateUser({ email, name, password }).unwrap();
    } catch (_error) {
      // RTK Query exposes the error via the mutation state for rendering.
    }
  };

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
      <Input
        extraClass="mb-6"
        icon="EditIcon"
        name="name"
        onChange={(event) => setName(event.target.value)}
        placeholder="Имя"
        value={name}
      />
      <EmailInput
        extraClass="mb-6"
        isIcon
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Логин"
        value={email}
      />
      <PasswordInput
        extraClass="mb-6"
        icon="EditIcon"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Пароль"
        value={password}
      />
      {isChanged ? (
        <div className={styles.actions}>
          <Button
            disabled={isLoading}
            htmlType="button"
            onClick={handleCancel}
            size="medium"
            type="secondary"
          >
            Отмена
          </Button>
          <Button disabled={isLoading} htmlType="submit" size="medium" type="primary">
            {isLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </div>
      ) : null}
      <p className={`${styles.error} text text_type_main-default mt-6`}>
        {getErrorMessage(error, '')}
      </p>
    </form>
  );
};
