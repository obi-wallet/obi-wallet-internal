import { Brand, terra, terraChains } from "@obi-wallet/common";
import { loopMobileDevConfig, obiMobileConfig } from "@obi-wallet/config";
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

  describe("MsgSend", () => {
    const message = new MsgSend(address, address, { uluna: 1 });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("To:")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    test("Loop", async () => {
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

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Init Contract")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Init Contract")).toBeDefined();
    });
  });

  describe("MsgExecuteContract", () => {
    const message = new MsgExecuteContract(address, address, {});

    test("Obi", async () => {
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

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Execute Wasm Contract")).toBeDefined();
      expect(
        screen.getByText("terra18aw4eedj4v325...edl9ggaayktq4")
      ).toBeDefined();
    });
  });

  describe("MsgExecuteContract (propose_update_owner)", () => {
    const message = terra.getProposeUpdateOwnerMessage({
      sender: address,
      proxyAddress: address,
      newOwner: address,
      signers: [],
      codeId: terraChains[chainId].currentCodeId,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Update Multikey (step 1 of 2)")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Update Multikey (step 1 of 2)")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (confirm_update_owner)", () => {
    const message = terra.getConfirmUpdateOwnerMessage({
      sender: address,
      proxyAddress: address,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Confirm Update (step 2 of 2)")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Confirm Update (step 2 of 2)")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (new_account)", () => {
    const message = terra.getNewAccountMessage({
      address,
      signers: [],
      chainId,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Create Obi Wallet")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Create Obi Wallet")).toBeDefined();
    });
  });

  describe("MsgExecuteContract (new_account)", () => {
    const message = terra.getMigrateMessage({
      proxyAddress: address,
      admin: address,
      chainId,
      signers: [],
      codeId: terraChains[chainId].currentCodeId,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Update Obi Wallet")).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Update Obi Wallet")).toBeDefined();
    });
  });

  describe("MsgDelegate", () => {
    const message = terra.getStakeMessage({
      sender: address,
      validator: terraChains["phoenix-1"].obiValidator,
      amount: 1,
      chainId,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Staking to:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Staking to:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });
  });

  describe("MsgUndelegate", () => {
    const message = terra.getUnstakeMessage({
      sender: address,
      validator: terraChains["phoenix-1"].obiValidator,
      amount: 1,
      chainId,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unstaking from:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Unstaking from:")).toBeDefined();
      expect(screen.getByText("0.000001LUNA")).toBeDefined();
    });
  });

  describe("MsgWithdrawDelegationReward", () => {
    const message = terra.getWithdrawRewardsMessage({
      sender: address,
      validator: terraChains["phoenix-1"].obiValidator,
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(
        screen.getByText("Withdrawing staking rewards from:")
      ).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });

    // TODO: Loop's not showing the amount
    test.skip("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(
        screen.getByText("Withdrawing staking rewards from:")
      ).toBeDefined();
      expect(screen.getByText("0LUNA")).toBeDefined();
    });
  });

  describe("Unknown Message", () => {
    const message = new MsgBeginRedelegate(
      address,
      address,
      address,
      Coin.fromAmino({ denom: "uluna", amount: "1" })
    );

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unknown message")).toBeDefined();
      expect(screen.getByText("Please check data tab")).toBeDefined();
    });

    test("Loop", async () => {
      renderPrettyMessage({ message, brand: Brand.Loop });
      expect(screen.getByText("Unknown message")).toBeDefined();
      expect(screen.getByText("Please check data tab")).toBeDefined();
    });
  });

  describe("Error Boundary", () => {
    jest.spyOn(console, "error").mockImplementation(() => {
      // noop
    });
    const message = Msg.fromAmino({
      type: "bank/MsgSend",
      // @ts-expect-error Intentionally wrong
      value: {},
    });

    test("Obi", async () => {
      renderPrettyMessage({ message, brand: Brand.Obi });
      expect(screen.getByText("Unknown message")).toBeDefined();
    });

    test("Loop", async () => {
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
    render(
      <Provider key={brand} config={getConfig(brand)}>
        <PrettyMessage message={message.toAmino()} />
      </Provider>
    );
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
