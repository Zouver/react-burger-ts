export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const PASSWORD_RESET_REQUESTED_KEY = 'passwordResetRequested';

const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
};

const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {
    // Storage can be unavailable in private or restricted browser contexts.
  }
};

const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (_error) {
    // Storage can be unavailable in private or restricted browser contexts.
  }
};

export const getAccessToken = (): string | null => getStorageItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null => getStorageItem(REFRESH_TOKEN_KEY);

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  setStorageItem(ACCESS_TOKEN_KEY, accessToken);
  setStorageItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
};

export const markPasswordResetRequested = (): void => {
  setStorageItem(PASSWORD_RESET_REQUESTED_KEY, 'true');
};

export const clearPasswordResetRequested = (): void => {
  removeStorageItem(PASSWORD_RESET_REQUESTED_KEY);
};

export const isPasswordResetRequested = (): boolean =>
  getStorageItem(PASSWORD_RESET_REQUESTED_KEY) === 'true';
