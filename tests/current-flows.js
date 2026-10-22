async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:8095');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByText('Settings', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'Save Mount Tammany to Next up' }).click();
  await page.getByRole('tab', { name: /Your lists/ }).click();
  await page.getByRole('button', { name: 'Want to hike', exact: true }).click();
  await page.getByText('Mount Tammany', { exact: true }).waitFor();
  await page.getByRole('textbox', { name: 'Filter by location' }).fill('nowhere');
  await page.getByText('No hikes match yet.', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('button', { name: 'Ranked', exact: true }).click();
  for (let i = 1; i <= 7; i++) {
    await page.getByRole('button', { name: 'Log a hike', exact: true }).click();
    check(await page.getByRole('button', { name: 'Save', exact: true }).isDisabled(), 'Empty form must not save');
    await page.getByRole('textbox', { name: 'Hike name', exact: true }).fill(`Test trail ${i}`);
    await page.getByRole('radio', { name: 'Loved it', exact: true }).click();
    await page.getByRole('radio', { name: 'Difficulty: Moderate', exact: true }).click();
    await page.getByRole('textbox', { name: 'Location', exact: true }).fill('New York');
    await page.getByRole('textbox', { name: 'Duration in minutes' }).fill('-1');
    check(await page.getByRole('button', { name: 'Save', exact: true }).isDisabled(), 'Invalid duration blocked');
    await page.getByRole('textbox', { name: 'Duration in minutes' }).fill('120');
    await page.getByRole('textbox', { name: 'Length in miles' }).fill('4');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    if (i > 1) {
      await page.getByText('Which hike did you enjoy more?', { exact: true }).waitFor();
      while (await page.getByRole('button', { name: `Test trail ${i}`, exact: true }).count()) await page.getByRole('button', { name: `Test trail ${i}`, exact: true }).click();
    }
    await page.getByRole('heading', { name: 'Your lists' }).waitFor();
    if (i < 7) await page.getByText(`Your scores unlock at 7 hikes`, { exact: false }).waitFor();
  }
  await page.getByText('Your personal scores are unlocked', { exact: true }).waitFor();
  await page.getByRole('button', { name: /Test trail 7/ }).click();
  await page.getByText('Your personal score', { exact: true }).waitFor();
  check(!(await page.getByText('Revealed after seven ranked hikes', { exact: true }).count()), 'Detail unlocked');
  await page.getByRole('button', { name: /Back to/ }).click();
  await page.getByRole('button', { name: /1 hour/, exact: false }).click();
  await page.getByText('No hikes match yet.', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('tab', { name: 'Your rankings', exact: true }).click();
  await page.getByRole('heading', { name: 'Your rankings', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Rank 1: Test trail 7', exact: true }).click();
  await page.getByRole('button', { name: 'Back to Your rankings', exact: true }).click();
  await page.getByRole('heading', { name: 'Your rankings', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Profile', exact: true }).click();
  await page.getByRole('heading', { name: 'Profile', exact: true }).waitFor();
  await page.getByRole('button', { name: /Settings Appearance/ }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('heading', { name: 'Profile', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Your lists', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 700 });
  const plus = await page.getByRole('button', { name: 'Log a hike', exact: true }).boundingBox();
  check(Math.abs(plus.x + plus.width / 2 - 160) < 1, 'Plus remains centered');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No narrow viewport overflow');
  await page.screenshot({ path: '.playwright-cli/current-lists.png' });
  check(errors.length === 0, errors.join('\n'));
  return { passed: true, flows: 'settings, bookmarks, location filter, validation, seven logs, binary comparisons, score unlock, duration filter, 320px layout', errors };
}
