# Obi Wallet

> ## Disclaimer
>
> Obi is in alpha. Security audits are pending. Current implementations are intended for trial purposes.

This is a monorepo containing our mobile app and our web modal. To enable code-sharing, we utilize `react-native-web`.

## Running the Modal
You must have 1Password CLI installed and access to the appropriate vault in order to run setup.
- `yarn`
- `yarn setup`
- `nx serve modal-web`
- Open a browser to `localhost:4200/<THEME>`, e.g. `localhost:4200/ztx`


## ZTX's implementation

ZTX's implementation has three stages:

- Claim NFT promotional
- Website modal
- Unity modal

The initial stage (Claim NFT) has various characteristics that remove the need of most of the code in this repository:

- Like the other two stages, Claim NFT uses the web modal approach. Therefore, anything mobile app-related won't be used.
- Unlike the other two stages, Claim NFT doesn't use the UI that we usually provide.
- The Claim NFT implementation uses only a subset of the features provided by our SDK. The modal implementations will use more, including Multikey components.

The code used by Claim NFT is outlined next:

- ZTX uses our `@obi-wallet/modal-ztx` npm package (see https://github.com/obi-wallet/modal-ztx) to embed an iframe with URL https://wallet.obimoney.games/ztx. `@obi-wallet/modal-ztx` exposes functions that communicate with that iframe via `window.postMessage` (see `MessageHandler` in `libs/modal/src/modal.tsx`).
- https://wallet.obimoney.games/ztx is handled by the Next.js located in `apps/modal-web`. The entry point is therefore the route `[config]` with route param `ztx`. As seen in `apps/modal-web/src/modal.tsx`, the route param specifies the config to be used and utilizes the modal package located in `libs/modal`.
- Please note that the ZTX config (located in `libs/config/src/modal/ztx`) specifies `headless: true` and `ethereumBalances: true`. This simplifies some of the code paths. For example, `Modal` in `libs/modal/src/modal.tsx` doesn't render `StateRenderer` in headless mode, henceforth removing all UI components in `libs/common`.
- Furthermore: the ZTX config only enables chain `pulsar-3`. Therefore, non-`secret-js`-specific chain implementations in `libs/sdk` aren't relevant.
