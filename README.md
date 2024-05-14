# obi-wallet-internal

See docs.obi.money

## Testing Strategy

### Next.js Test Runner

- We have a custom Next.js test runner that runs the tests inside the Next.js instance.
- The tests are defined in `app/web/src/tests/client` (run on the client) and `app/web/src/tests/server` (run on the
  server).
- You can see the results of the tests via `http://localhost:3000/tests` or execute them headless via Playwright
  with `yarn test-next`.
- Our CI runs these tests.

#### What to use for

- Unit & integration tests for logic (i.e., no UI).

### Playwright

- Apart from the Playwright tests that run the Next.js tests, you can also define additional e2e tests.
- The tests are defined in `app/web/src/__tests__/e2e`.
- You can execute the tests via `yarn test-next`.
- Our CI runs these tests.

#### What to use for

- End-to-end tests.

### Storybook

- We use [Storybook Test Runner](https://github.com/storybookjs/test-runner) that allow us to write tests inside
  Storybook.
- You can execute the tests via `yarn test-storybook`.
- Our CI does not run these tests.

#### What to use for

- Client-side tests that require UI or a specific "setup" (e.g., hooks requiring the store).

### Jest

- We also have a Jest setup that is run in a Node.js environment.
- The tests are defined in `app/web/src/__tests__`.
- You can execute the tests via `yarn test`.
- If you run into complications that do not occur in the Next.js environment (e.g., ESM modules, browser APIs, differences in bundler behavior), you probably want to use the Next.js test runner instead.

#### What to use for

- Tests for API routes (utilizing `next-test-api-route-handler`).
- Other tests that don't require a browser or a specific setup.
