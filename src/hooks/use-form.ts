import { useCallback, useState } from 'react';

import type { ChangeEvent } from 'react';

type TFormValues = Record<string, string>;

type TUseFormResult<TValues extends TFormValues> = {
  handleChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  setValues: React.Dispatch<React.SetStateAction<TValues>>;
  values: TValues;
};

export const useForm = <TValues extends TFormValues>(
  initialValues: TValues
): TUseFormResult<TValues> => {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
      const { name, value } = event.target;

      setValues((currentValues) => ({
        ...currentValues,
        [name]: value,
      }));
    },
    []
  );

  return { handleChange, setValues, values };
};
