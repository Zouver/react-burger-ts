import { stellarApi } from '@services/api/stellarApi.ts';
import { getRawAccessToken } from '@services/auth/tokenStorage.ts';
import { parseOrderResponse, parseOrdersSnapshot } from '@utils/orders.ts';

import type { TOrder, TOrdersFeed } from '@utils/types.ts';

const ALL_ORDERS_URL = 'wss://new-stellarburgers.education-services.ru/orders/all';
const USER_ORDERS_URL = 'wss://new-stellarburgers.education-services.ru/orders';
const RECONNECT_DELAYS = [500, 1000, 2000, 4000, 8000];
const TOKEN_ERROR_MESSAGE = 'Invalid or missing token';

const createInitialFeed = (): TOrdersFeed => ({
  connectionStatus: 'connecting',
  error: null,
  hasReceivedData: false,
  orders: [],
  total: 0,
  totalToday: 0,
});

type TStreamOrdersOptions = {
  cacheEntryRemoved: Promise<void>;
  getUrl: () => string | null;
  refreshAuth?: () => Promise<boolean>;
  update: (recipe: (draft: TOrdersFeed) => void) => void;
};

const getSocketPayload = (event: MessageEvent<unknown>): unknown => {
  if (typeof event.data !== 'string') {
    return null;
  }

  try {
    return JSON.parse(event.data) as unknown;
  } catch (_error) {
    return null;
  }
};

const isTokenErrorPayload = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  value.message === TOKEN_ERROR_MESSAGE;

const streamOrders = async ({
  cacheEntryRemoved,
  getUrl,
  refreshAuth,
  update,
}: TStreamOrdersOptions): Promise<void> => {
  let activeSocket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let isStopped = false;
  let isRefreshing = false;

  const setTerminalError = (message: string): void => {
    update((draft) => {
      draft.connectionStatus = 'error';
      draft.error = message;
    });
  };

  const closeSocket = (): void => {
    if (!activeSocket) {
      return;
    }

    activeSocket.onclose = null;
    activeSocket.close();
    activeSocket = null;
  };

  const connect = (): void => {
    if (isStopped) {
      return;
    }

    const url = getUrl();

    if (!url) {
      setTerminalError('Не удалось подключиться: отсутствует токен доступа.');
      return;
    }

    const socket = new WebSocket(url);
    activeSocket = socket;

    socket.onopen = (): void => {
      if (socket !== activeSocket) {
        return;
      }

      update((draft) => {
        draft.connectionStatus = 'connected';
        draft.error = null;
      });
    };

    socket.onmessage = (event): void => {
      if (socket !== activeSocket) {
        return;
      }

      const payload = getSocketPayload(event);

      if (isTokenErrorPayload(payload) && refreshAuth && !isRefreshing) {
        isRefreshing = true;
        closeSocket();

        void refreshAuth().then((isRefreshed) => {
          isRefreshing = false;

          if (isStopped) {
            return;
          }

          if (!isRefreshed) {
            setTerminalError(
              'Сессия истекла. Войдите в аккаунт, чтобы увидеть историю заказов.'
            );
            return;
          }

          reconnectAttempt = 0;
          connect();
        });

        return;
      }

      const snapshot = parseOrdersSnapshot(payload);

      if (!snapshot) {
        return;
      }

      reconnectAttempt = 0;
      update((draft) => {
        draft.connectionStatus = 'connected';
        draft.error = null;
        draft.hasReceivedData = true;
        draft.orders = snapshot.orders;
        draft.total = snapshot.total;
        draft.totalToday = snapshot.totalToday;
      });
    };

    socket.onerror = (): void => {
      socket.close();
    };

    socket.onclose = (): void => {
      if (socket !== activeSocket || isStopped || isRefreshing) {
        return;
      }

      activeSocket = null;

      if (reconnectAttempt >= RECONNECT_DELAYS.length) {
        setTerminalError(
          'Соединение с лентой заказов потеряно. Попробуйте обновить страницу.'
        );
        return;
      }

      const delay = RECONNECT_DELAYS[reconnectAttempt];
      reconnectAttempt += 1;
      update((draft) => {
        draft.connectionStatus = 'reconnecting';
        draft.error = 'Восстанавливаем соединение с лентой заказов…';
      });
      reconnectTimer = setTimeout(connect, delay);
    };
  };

  connect();
  await cacheEntryRemoved;
  isStopped = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  closeSocket();
};

export const ordersApi = stellarApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query<TOrdersFeed, void>({
      keepUnusedDataFor: 0,
      onCacheEntryAdded: async (_arg, lifecycle) => {
        await streamOrders({
          cacheEntryRemoved: lifecycle.cacheEntryRemoved,
          getUrl: () => ALL_ORDERS_URL,
          update: (recipe) => {
            lifecycle.updateCachedData(recipe);
          },
        });
      },
      queryFn: () => ({ data: createInitialFeed() }),
    }),
    getOrderById: builder.query<TOrder | null, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => parseOrderResponse(response),
    }),
    getUserOrders: builder.query<TOrdersFeed, void>({
      keepUnusedDataFor: 0,
      onCacheEntryAdded: async (_arg, lifecycle) => {
        await streamOrders({
          cacheEntryRemoved: lifecycle.cacheEntryRemoved,
          getUrl: () => {
            const token = getRawAccessToken();

            return token
              ? `${USER_ORDERS_URL}?token=${encodeURIComponent(token)}`
              : null;
          },
          refreshAuth: async () => {
            const request = lifecycle.dispatch(
              stellarApi.endpoints.getUser.initiate(undefined, {
                forceRefetch: true,
                subscribe: false,
              })
            );

            try {
              await request.unwrap();
              return Boolean(getRawAccessToken());
            } catch (_error) {
              return false;
            } finally {
              request.unsubscribe();
            }
          },
          update: (recipe) => {
            lifecycle.updateCachedData(recipe);
          },
        });
      },
      queryFn: () => ({ data: createInitialFeed() }),
    }),
  }),
});

export const { useGetAllOrdersQuery, useGetOrderByIdQuery, useGetUserOrdersQuery } =
  ordersApi;
