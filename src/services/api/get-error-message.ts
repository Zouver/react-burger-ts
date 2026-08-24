export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = error.data;

    if (
      typeof data === 'object' &&
      data &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message;
    }
  }

  if (
    typeof error === 'object' &&
    error &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
};
