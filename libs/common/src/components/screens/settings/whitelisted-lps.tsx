import { useTheme } from "@emotion/react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Image, View } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAsyncEffect } from "rooks";

import { isSmallScreenNumber } from "../../../helpers";
import { RootStackParamList, SettingsRoute } from "../../../router";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { Text } from "../../typography";

export type WhitelistedLpsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SettingsRoute.WhitelistedLPs
>;

const osmosisWhitelistedLps = ["12", "5", "3", "10", "34", "6", "1", "18"];
const osmoIcon = "tokens/osmo.svg";

const osmosisWhitelistedLpsData = [
  {
    id: "12",
    name: "ATOM / OSMO",
    asset1Logo: "tokens/atom.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "5",
    name: "aUSDC/OSMO",
    asset1Logo: "tokens/usdc.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "3",
    name: "JUNOX/OSMO",
    asset1Logo: "tokens/juno.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "10",
    name: "MARS/OSMO",
    asset1Logo: "tokens/mars.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "34",
    name: "QCK/OSMO",
    asset1Logo: "tokens/qck.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "6",
    name: "nUSD/OSMO",
    asset1Logo: "tokens/usdc.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "1",
    name: "ION/OSMO",
    asset1Logo: "tokens/ion.svg",
    asset2Logo: osmoIcon,
  },
  {
    id: "18",
    name: "AKT/OSMO",
    asset1Logo: "tokens/akt.svg",
    asset2Logo: osmoIcon,
  },
];

interface Token {
  denom: string;
  amount: string;
}

interface PoolParams {
  swap_fee: string;
  exit_fee: string;
  smooth_weight_change_params: any; // You can replace 'any' with the specific type if available
}

interface TotalShares {
  denom: string;
  amount: string;
}

interface PoolAsset {
  token: Token;
  weight: string;
}

interface Pool {
  "@type": string;
  address: string;
  id: string;
  pool_params: PoolParams;
  future_pool_governor: string;
  total_shares: TotalShares;
  pool_assets: PoolAsset[];
  total_weight: string;
}

export const WhitelistedLpsScreen = observer<WhitelistedLpsScreenProps>(
  function WhitelistedLPsScreen({ navigation }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [lpList, setLpList] = useState<any[]>([]);

    useAsyncEffect(async () => {
      // const lpList = await setLpList(lpList);
      const { pools }: { pools: Pool[] } = await fetch(
        "https://lcd.osmotest5.osmosis.zone/osmosis/gamm/v1beta1/pools?pagination.limit=1000"
      ).then((res) => res.json());
      const lpList = pools
        .filter((pool) => osmosisWhitelistedLps.includes(pool.id))
        .sort(
          (a, b) =>
            osmosisWhitelistedLps.indexOf(a.id) -
            osmosisWhitelistedLps.indexOf(b.id)
        );

      setLpList(lpList);
      setLoading(false);
    }, []);

    return (
      <OsmosisScreenContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              marginTop: 10,
              paddingTop: isSmallScreenNumber(0, 32),
              paddingBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "#F6F5FF",
                  fontSize: isSmallScreenNumber(20, 24),
                  fontWeight: "600",
                }}
              >
                Whitelisted LPs
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>Loading...</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                {lpList.map((item) => (
                  <PoolListItem item={item} key={item.id} />
                ))}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </OsmosisScreenContainer>
    );
  }
);
interface PoolListItemProps {
  item: Pool;
}
const PoolListItem = observer<PoolListItemProps>(function PoolListItem({
  item,
}) {
  const theme = useTheme();
  const data = osmosisWhitelistedLpsData.find((lp) => lp.id === item.id);
  const baseURl = "https://testnet.osmosis.zone/";

  return (
    <View
      style={{
        backgroundColor: theme.colors.panelBackground,
        margin: 10,
        borderRadius: 7,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            position: "relative",
            width: 60,
            height: 50,
            marginRight: 10,
            padding: 10,
          }}
        >
          <Image
            source={{ uri: baseURl + data?.asset2Logo }}
            style={{
              width: 40,
              height: 40,
              right: 0,
              bottom: 0,
              position: "absolute",
            }}
          />
          <Image
            source={{ uri: baseURl + data?.asset1Logo }}
            style={{
              width: 40,
              height: 40,
              left: 0,
              top: 0,
              position: "absolute",
            }}
          />
        </View>

        <View>
          <Text style={{ color: "white" }}>{data?.name}</Text>
          <Text style={{ color: "white" }}>Pool #{item.id}</Text>
        </View>
      </View>
      <Switch value={true} />
    </View>
  );
});
