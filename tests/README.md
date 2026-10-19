# Frontend interaction checks

Run Expo's web preview on port 8095, then use Playwright CLI:

```powershell
npx.cmd expo start --web --port 8095
```

In another terminal (requires `playwright-cli`):

```powershell
playwright-cli.cmd -s=viewpoint-test open http://localhost:8095 --browser=chrome
playwright-cli.cmd -s=viewpoint-test run-code --filename=tests/frontend-smoke.js
```

The test reloads the app, which clears temporary hikes. It checks the sample feed, details, form validation, save and cancel paths, photo failures, and a 320px viewport. Confirmation responses and image failures are controlled during the test. This is a browser test of shared React Native code, not native device or gesture verification.
