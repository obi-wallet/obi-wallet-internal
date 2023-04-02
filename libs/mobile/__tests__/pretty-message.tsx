import { Brand, terra } from "@obi-wallet/common";
import { loopMobileDevConfig, obiMobileConfig } from "@obi-wallet/config";
import {
  createGatekeeperConfig,
  MultisigKey,
  MultisigWallet,
  Sdk,
  terraChains,
} from "@obi-wallet/sdk";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Coin,
  Msg,
  MsgBeginRedelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
} from "@terra-money/feather.js";
import { render, screen } from "@testing-library/react-native";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

import {
  createSessionKey,
  destroySessionKey,
  rmFlex,
  upsertBeneficiary,
  upsertBeneficiaryAnnually,
  upsertFlex,
} from "../__fixtures__/messages";
import { PrettyMessage } from "../src/app/modals/signature-modal/pretty-message";
import { Provider } from "../src/app/provider";

function getConfig(brand: Brand) {
  switch (brand) {
    case Brand.Obi:
      return obiMobileConfig;
    case Brand.Loop:
      return loopMobileDevConfig;
  }
}

describe("Terra", () => {
  const address = "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4";
  const chainId = "phoenix-1";
  const sdk = Sdk.chainId(chainId);
  const codeIds = terraChains[chainId].currentCodeIds;
  const wallet = MultisigWallet.create({
    type: "multisig",
    data: {
      chain: chainId,
      currentAccount: null,
      gatekeeperConfig: createGatekeeperConfig().toJSON(),
      owner: MultisigKey.create(chainId).toJSON(),
      singlesigWallets: [],
      proxyAddress: {
        v: 1,
        address,
      },
    },
  });

  describe("MsgSend", () => {
    const message = new MsgSend(address, address, { uluna: 1 });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("To:")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Send")).toBeDefined();
      expect(
        screen.getByText("terra18aw4ee...yktq4 will receive:")
      ).toBeDefined();
      expect(screen.getByText("0.000001 LUNA")).toBeDefined();
    });
  });

  describe("MsgInstantiateContract", () => {
    const message = new MsgInstantiateContract(address, address, 1, {});

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Init Contract")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Init Contract")).toBeDefined();
    });
  });

  describe("MsgExecuteContract", () => {
    const message = new MsgExecuteContract(address, address, {});

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Execute Wasm Contract")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
      expect(
        screen.getByText("Check the data tab for the full message")
      ).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Execute Wasm Contract")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("MsgExecuteContract (propose_update_owner)", () => {
    const message = sdk.getProposeUpdateOwnerMessage({
      wallet,
      newOwner: MultisigKey.create(chainId),
      codeIds,
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Update Multikey (step 1 of 2)")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Update Multikey (step 1 of 2)")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (confirm_update_owner)", () => {
    const message = sdk.getConfirmUpdateOwnerMessage({
      wallet,
      newOwner: MultisigKey.create(chainId),
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Confirm Update (step 2 of 2)")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Confirm Update (step 2 of 2)")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (create wallet)", () => {
    const message = sdk.getCreateWalletMessage(MultisigKey.create(chainId));

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Create Obi Wallet")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Create Obi Wallet")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (update wallet)", () => {
    const message = sdk.getUpdateWalletMessage({
      wallet,
      codeIds: terraChains[chainId].currentCodeIds,
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Update Obi Wallet")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Update Obi Wallet")).toBeDefined();
    });
  });

  describe("MsgDelegate", () => {
    const message = terra.getStakeMessage({
      sender: address,
      validator: terraChains[chainId].obiValidator,
      amount: 1,
      chainId,
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Staking to:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Staking to:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });
  });

  describe("MsgUndelegate", () => {
    const message = terra.getUnstakeMessage({
      sender: address,
      validator: terraChains[chainId].obiValidator,
      amount: 1,
      chainId,
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unstaking from:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Unstaking from:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });
  });

  describe("MsgWithdrawDelegationReward", () => {
    const message = terra.getWithdrawRewardsMessage({
      sender: address,
      validator: terraChains[chainId].obiValidator,
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(
        screen.getByText("Withdrawing staking rewards from:")
      ).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(
        screen.getByText("Withdrawing staking rewards from:")
      ).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });
  });

  describe("Add/Update Permissioned Address ", () => {
    test("Obi", () => {
      renderPrettyMessage({ message: upsertFlex, brand: Brand.Obi });
      expect(screen.getByText("Add/Update Permissioned Address")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
    test("Loop", () => {
      renderPrettyMessage({ message: upsertFlex, brand: Brand.Loop });
      expect(screen.getByText("Add/Update Permissioned Address")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("Remove Permissioned Address", () => {
    test("Obi", () => {
      renderPrettyMessage({ message: rmFlex, brand: Brand.Obi });
      expect(screen.getByText("Remove Permissioned Address")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
    test("Loop", () => {
      renderPrettyMessage({ message: rmFlex, brand: Brand.Loop });
      expect(screen.getByText("Remove Permissioned Address")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("Create Session Key", () => {
    test("Obi", () => {
      renderPrettyMessage({ message: createSessionKey, brand: Brand.Obi });
      expect(screen.getByText("Create Session Key")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
    test("Loop", () => {
      renderPrettyMessage({ message: createSessionKey, brand: Brand.Loop });
      expect(screen.getByText("Create Session Key")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("Destroy Session Key", () => {
    it("Obi", () => {
      renderPrettyMessage({ message: destroySessionKey, brand: Brand.Obi });
      expect(screen.getByText("Destroy Session Key")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
    test("Loop", () => {
      renderPrettyMessage({ message: destroySessionKey, brand: Brand.Loop });
      expect(screen.getByText("Destroy Session Key")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("Add/Update Beneficiary", () => {
    test("Obi", () => {
      renderPrettyMessage({ message: upsertBeneficiary, brand: Brand.Obi });
      expect(screen.getByText("Add/Update Beneficiary")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
      expect(
        screen.getByText(
          "will receive 1% monthly after 12 months of inactivity"
        )
      ).toBeDefined();
    });
    test("Loop", () => {
      renderPrettyMessage({ message: upsertBeneficiary, brand: Brand.Loop });
      expect(screen.getByText("Add/Update Beneficiary")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
      expect(
        screen.getByText(
          "will receive 1% monthly after 12 months of inactivity"
        )
      ).toBeDefined();
    });
    test("Annually", () => {
      renderPrettyMessage({
        message: upsertBeneficiaryAnnually,
        brand: Brand.Obi,
      });

      expect(
        screen.getByText(
          "will receive 10% annually after 12 months of inactivity"
        )
      ).toBeDefined();
    });
  });

  describe("Unknown Message", () => {
    const message = new MsgBeginRedelegate(
      address,
      address,
      address,
      Coin.fromAmino({ denom: "uluna", amount: "1" })
    );

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unknown message")).toBeDefined();
      expect(screen.getByText("Please check data tab")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Unknown message")).toBeDefined();
      expect(screen.getByText("Please check data tab")).toBeDefined();
    });
  });

  describe("Error Boundary", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => {
        // noop
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const message = Msg.fromAmino({
      type: "bank/MsgSend",
      value: {},
    });

    test("Obi", () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unknown message")).toBeDefined();
    });

    test("Loop", () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Unknown message")).toBeDefined();
    });
  });

  function renderPrettyMessage({
    message,
    brand,
  }: {
    message: Msg;
    brand: Brand;
  }) {
    const Wrapper = createWrapper({ brand });
    return render(
      <Wrapper>
        <PrettyMessage message={message.toAmino()} />
      </Wrapper>
    );
  }

  function createWrapper({ brand }: { brand: Brand }) {
    // eslint-disable-next-line react/function-component-definition
    return observer(function Wrapper({ children }: { children: ReactNode }) {
      return (
        <Provider
          key={brand}
          config={getConfig(brand)}
          QueryClientProvider={QueryClientProvider}
        >
          {children}
        </Provider>
      );
    });
  }
});

describe("Cosmos", () => {
  test.todo("MsgSend");
  test.todo("MsgInstantiateContract");
  test.todo("MsgInstantiateContract (New Obi wallet)");
  test.todo("MsgExecuteContract");
  test.todo("MsgExecuteContract (propose_update_admin)");
  test.todo("MsgExecuteContract (confirm_update_admin)");
  test.todo("MsgDelegate");
  test.todo("MsgUndelegate");
  test.todo("MsgWithdrawDelegationReward");
  test.todo("Unknown Message");
  test.todo("Error Boundary");
});
