import { Brand, Config, Feature, WalletType } from "@obi-wallet/common";
import {
  Coin,
  Msg,
  MsgBeginRedelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
} from "@terra-money/terra.js";
import { render, screen } from "@testing-library/react-native";

import { PrettyMessage } from "../src/app/modals/signature-modal/pretty-message";
import { Provider } from "../src/app/provider";

const config: Config = {
  brand: Brand.Obi,
  defaultMultisigWalletType: WalletType.TerraMultisig,
  cosmosChains: {
    enabled: ["juno-1", "uni-3"],
    default: "juno-1",
  },
  terraChains: {
    enabled: ["phoenix-1"],
    default: "phoenix-1",
  },
  languages: {
    enabled: ["en"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: false,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: false,
    [Feature.RecoveryWorkflow]: false,
    [Feature.SinglesigWallets]: false,
    [Feature.Staking]: false,
    [Feature.InAppPurchases]: false,
  },
};

describe("Terra", () => {
  const address = "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4";

  test("PrettyMessageSend", async () => {
    const message = new MsgSend(address, address, { uluna: 1 });
    renderPrettyMessage(message);
    expect(screen.getByText("Send")).toBeDefined();
    expect(
      screen.getByText("terra18aw4ee...yktq4 will receive:")
    ).toBeDefined();
    expect(screen.getByText("0.000001 LUNA")).toBeDefined();
  });

  test("PrettyMessageInstantiateContract", async () => {
    const message = new MsgInstantiateContract(address, address, 1, {});
    renderPrettyMessage(message);
    expect(screen.getByText("Init Contract")).toBeDefined();
  });

  test("PrettyMessageExecuteContract", async () => {
    const message = new MsgExecuteContract(address, address, {});
    renderPrettyMessage(message);
    expect(screen.getByText("Execute Wasm Contract")).toBeDefined();
    expect(
      screen.getByText("Execute wasm contract terra18aw4ee...yktq4")
    ).toBeDefined();
  });

  test.todo("PrettyMessageExecuteContract (create new obi account)");
  test.todo("PrettyMessageExecuteContract (propose_update_admin");
  test.todo("PrettyMessageExecuteContract (confirm_update_admin");

  test("PrettyMessageUnknown", async () => {
    const message = new MsgBeginRedelegate(
      address,
      address,
      address,
      Coin.fromAmino({ amount: "1", denom: "uluna" })
    );
    renderPrettyMessage(message);
    expect(screen.getByText("Unknown message")).toBeDefined();
    expect(screen.getByText("Please check data tab")).toBeDefined();
  });

  test("Error Boundary", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {
      // noop
    });
    const message = Msg.fromAmino({
      type: "bank/MsgSend",
      // @ts-expect-error Intentionally wrong
      value: {},
    });
    renderPrettyMessage(message);
    expect(screen.getByText("Unknown message")).toBeDefined();
  });

  function renderPrettyMessage(message: Msg) {
    render(
      <Provider initialConfig={config}>
        <PrettyMessage message={message.toAmino()} />
      </Provider>
    );
  }
});

describe("Cosmos", () => {
  test.todo("PrettyMessageSend");
  test.todo("PrettyMessageInstantiateContract");
  test.todo("PrettyMessageInstantiateContract (Obi Wallet)");
  test.todo("PrettyMessageExecuteContract");
  test.todo("PrettyMessageExecuteContract (propose_update_admin");
  test.todo("PrettyMessageExecuteContract (confirm_update_admin");
  test.todo("PrettyMessageUnknown");
  test.todo("Error Boundary");
});
