import { Bech32Address } from "@keplr-wallet/cosmos";
import { Text } from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { Sdk, SinglesigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { TouchableOpacity, View } from "react-native";

import { AbstractAccountItemProps } from "./common";
import { useUsdBalance } from "../../../../app/balances";
import { SinglesigAvatar } from "../../avatar";

export interface SinglesigWalletItemProps extends AbstractAccountItemProps {
  account: SinglesigWallet;
}

export const SinglesigWalletItem = observer<SinglesigWalletItemProps>(
  function SinglesigWalletItem({ account, active, onSetActive }) {
    const wallet = useCurrentWallet();
    const address = Sdk.chainId(
      wallet.chainId
    ).transactions.getAddressOfPublicKey(account.publicKey);
    const usdBalance = useUsdBalance({ address });

    return (
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 7,
          borderColor: active ? "white" : "transparent",
          backgroundColor: "#272727",
          marginVertical: 10,
          padding: 10,
        }}
        onPress={onSetActive}
        disabled={active}
      >
        <View style={{ flexDirection: "row" }}>
          <SinglesigAvatar style={{ width: 40, height: 40 }} />
          <View style={{ paddingLeft: 10 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              {usdBalance}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7E7E7E",
              }}
            >
              {Bech32Address.shortenAddress(address, 40)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);
