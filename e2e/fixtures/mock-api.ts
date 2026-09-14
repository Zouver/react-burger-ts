import { fileURLToPath } from 'node:url';

import type { Page } from '@playwright/test';

const harPath = fileURLToPath(new URL('./stellar-burger.har', import.meta.url));

export const mockApi = async (page: Page): Promise<void> => {
  await page.routeFromHAR(harPath, {
    notFound: 'abort',
    update: false,
    url: 'https://new-stellarburgers.education-services.ru/api/**',
  });
};
