import {
  Button,
  EmailInput,
  Input,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';

import { useForm } from '@hooks/use-form.ts';
import { getErrorMessage } from '@services/api/get-error-message.ts';
import { useUpdateUserMutation } from '@services/api/stellarApi.ts';
import { selectUser } from '@services/auth/authSlice.ts';
import { useAppSelector } from '@services/hooks.ts';

import type { FormEvent } from 'react';

import styles from './profile-form.module.css';

export const ProfileForm = (): React.JSX.Element => {
  const user = useAppSelector(selectUser);
  const [updateUser, { error, isLoading }] = useUpdateUserMutation();
  const { handleChange, setValues, values } = useForm({
    email: user?.email ?? '',
    name: user?.name ?? '',
    password: '',
  });

  useEffect(() => {
    setValues({
      email: user?.email ?? '',
      name: user?.name ?? '',
      password: '',
    });
  }, [user]);

  const isChanged =
    values.name !== (user?.name ?? '') ||
    values.email !== (user?.email ?? '') ||
    values.password !== '';

  const handleCancel = (): void => {
    setValues({
      email: user?.email ?? '',
      name: user?.name ?? '',
      password: '',
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!isChanged || isLoading) {
      return;
    }

    try {
      await updateUser(values).unwrap();
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
        onChange={handleChange}
        placeholder="Имя"
        value={values.name}
      />
      <EmailInput
        extraClass="mb-6"
        isIcon
        name="email"
        onChange={handleChange}
        placeholder="Логин"
        value={values.email}
      />
      <PasswordInput
        extraClass="mb-6"
        icon="EditIcon"
        name="password"
        onChange={handleChange}
        placeholder="Пароль"
        value={values.password}
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
