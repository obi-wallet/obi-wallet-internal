# obi-wallet-internal

Recoverable account and chain abstraction with an easy, multi-chain dashboard with WalletConnect.

See docs.obi.money

## Testing Strategy

### Vitest

- We have a Vitest setup that is run in a happy-dom environment.
- The tests are defined in `app/web/src/__tests__`.
- You can execute the tests via `yarn test`.
- If you run into complications that do not occur in the Next.js environment (e.g., ESM modules, browser APIs, differences in bundler behavior), you probably want to use the Next.js test runner instead.

#### What to use for

- Unit & integration tests for logic (i.e., no UI).
- Tests for API routes (utilizing `next-test-api-route-handler`).

### Storybook

- We use [Storybook Test Runner](https://github.com/storybookjs/test-runner) that allow us to write tests inside
  Storybook.
- You can execute the tests via `yarn test-storybook`.
- Our CI does not run these tests.

#### What to use for

- Client-side tests that require UI or a specific "setup" (e.g., hooks requiring the store).
