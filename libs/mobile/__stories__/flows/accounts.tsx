import { CommonActions } from "@react-navigation/native";
import { useEffect } from "react";

import {
  HomeBottomTabRoute,
  HomeDrawerRoute,
  useRootNavigation,
} from "../../src";
import { BaseAppWithoutProvider } from "../../src/app";
import { GatekeeperConfigDraft } from "../../src/fixture-helpers";
import { AccountsRoute } from "../../src/screens/accounts/accounts-stack";

const flexAccountRoutes = [
  {
    name: AccountsRoute.AccountsOverview,
  },
  {
    name: AccountsRoute.AddAccount,
  },
  {
    name: AccountsRoute.CreateFlexAccount,
  },
];

const beneficiaryRoutes = [
  {
    name: AccountsRoute.AccountsOverview,
  },
  {
    name: AccountsRoute.AddAccount,
  },
  {
    name: AccountsRoute.CreateBeneficiaryAccount,
  },
];

const importKeplrAccountRoutes = [
  {
    name: AccountsRoute.AccountsOverview,
  },
  {
    name: AccountsRoute.AddAccount,
  },
  {
    name: AccountsRoute.ImportLegacyAccount,
  },
  {
    name: AccountsRoute.ImportKeplrAccount,
  },
];

const importStationAccountRoutes = [
  {
    name: AccountsRoute.AccountsOverview,
  },
  {
    name: AccountsRoute.AddAccount,
  },
  {
    name: AccountsRoute.ImportLegacyAccount,
  },
  {
    name: AccountsRoute.ImportStationAccount,
  },
];

function Step({ step, routes }: { step: number; routes: { name: string }[] }) {
  return (
    <GatekeeperConfigDraft.Container>
      <StepInner step={step} routes={routes} />
    </GatekeeperConfigDraft.Container>
  );
}

function StepInner({
  step,
  routes,
}: {
  step: number;
  routes: { name: string }[];
}) {
  const navigation = useRootNavigation();
  useEffect(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: HomeDrawerRoute.HomeDrawer,
            state: {
              routes: [
                {
                  name: HomeBottomTabRoute.Accounts,
                  state: {
                    routes: routes.slice(0, step + 1),
                  },
                },
              ],
            },
          },
        ],
      })
    );
  }, [step, navigation, routes]);

  return <BaseAppWithoutProvider />;
}

export default {
  "Accounts Overview": <Step step={0} routes={flexAccountRoutes} />,
  "> Add Account": <Step step={1} routes={flexAccountRoutes} />,
  ">> Create Flex Account": <Step step={2} routes={flexAccountRoutes} />,
  ">> Add Beneficiary": <Step step={2} routes={beneficiaryRoutes} />,
  ">> Import Legacy Account": (
    <Step step={2} routes={importKeplrAccountRoutes} />
  ),
  ">>> Import Station Account": (
    <Step step={3} routes={importStationAccountRoutes} />
  ),
  ">>> Import Keplr Account": (
    <Step step={3} routes={importKeplrAccountRoutes} />
  ),
};
