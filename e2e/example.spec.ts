import { expect, test } from '@playwright/test';

import { mockApi } from './fixtures/mock-api.ts';

test('example', async ({ page }): Promise<void> => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByText('Соберите бургер')).toBeVisible();
});
