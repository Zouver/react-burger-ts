import { createBrowserRouter } from 'react-router-dom';

import { App } from '@components/app/app';
import { ProtectedRoute } from '@components/protected-route/protected-route.tsx';
import { FeedPage } from '@pages/feed-page/feed-page.tsx';
import { ForgotPasswordPage } from '@pages/forgot-password-page/forgot-password-page.tsx';
import { Home } from '@pages/home/home.tsx';
import { IngredientPage } from '@pages/ingredient-page/ingredient-page.tsx';
import { LoginPage } from '@pages/login-page/login-page.tsx';
import { NotFoundPage } from '@pages/not-found-page/not-found-page.tsx';
import { ProfileForm } from '@pages/profile-form/profile-form.tsx';
import { ProfileOrdersPage } from '@pages/profile-orders-page/profile-orders-page.tsx';
import { ProfilePage } from '@pages/profile-page/profile-page.tsx';
import { RegisterPage } from '@pages/register-page/register-page.tsx';
import { ResetPasswordPage } from '@pages/reset-password-page/reset-password-page.tsx';

export const router = createBrowserRouter([
  {
    children: [
      {
        element: <Home />,
        index: true,
      },
      {
        element: <IngredientPage />,
        path: 'ingredients/:id',
      },
      {
        element: <FeedPage />,
        path: 'feed',
      },
      {
        children: [
          {
            element: <LoginPage />,
            path: 'login',
          },
          {
            element: <RegisterPage />,
            path: 'register',
          },
          {
            element: <ForgotPasswordPage />,
            path: 'forgot-password',
          },
          {
            element: <ResetPasswordPage />,
            path: 'reset-password',
          },
        ],
        element: <ProtectedRoute onlyUnAuth />,
      },
      {
        children: [
          {
            children: [
              {
                element: <ProfileForm />,
                index: true,
              },
              {
                element: <ProfileOrdersPage />,
                path: 'orders',
              },
            ],
            element: <ProfilePage />,
            path: 'profile',
          },
        ],
        element: <ProtectedRoute />,
      },
      {
        element: <NotFoundPage />,
        path: '*',
      },
    ],
    element: <App />,
    path: '/',
  },
]);
