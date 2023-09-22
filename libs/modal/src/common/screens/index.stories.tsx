import {
  AccountsScreen,
  CloudKeyScreen,
  CreateWalletScreen,
  DeviceKeyScreen,
  EmailKeyScreen,
  EmailRecoveryScreen,
  getTwilioClient,
  HomeBottomTabRoute,
  KeyRoute,
  LookupProxyWalletsScreen,
  Modals,
  NfcKeyScreen,
  OnboardingRoute,
  PhoneKeyConfirmScreen,
  PhoneKeyRequestScreen,
  RootStack,
  SelectRecoveryMethodScreen,
  SettingsRoute,
  settingsScreens,
  SocialKeyScreen,
  useEnv,
  useSecurityQuestions,
  useStore,
  WelcomeScreen,
} from "@obi-wallet/common";
import {
  ObservableMultisigKey,
  getOrCreateDeviceKeyPair,
} from "@obi-wallet/sdk";
import type { Meta, StoryObj } from "@storybook/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useAsyncEffect } from "rooks";

const multisigDraftId = "multisigSettingsFixture";
const MultisigDraft = {
  draftId: multisigDraftId,
  Container: observer<{ children: ReactNode }>(function MultisigDraft({
    children,
  }) {
    const { chainStore, draftsStore, unityStore } = useStore();
    const draft = draftsStore.get({ id: multisigDraftId });
    const securityQuestions = useSecurityQuestions();
    const env = useEnv();

    useAsyncEffect(async () => {
      if (!draft) {
        const original = ObservableMultisigKey.create(undefined, chainStore.currentChain);
        // check if there's a unity device ID, to do unity
        // otherwise still does webauthn
        if (unityStore.getDeviceId) {
          original.setUnityKey(unityStore.getDeviceId);
        }
        const [key, _] = await getOrCreateDeviceKeyPair(false, false);
        original.setDeviceKey(key);
        original.setPhoneKey({
          publicKey: await getTwilioClient({
            demoMode: true,
            env,
          }).parsePublicKeyMagicCodeResponse({
            key: "",
          }),
          phoneNumber: "+1234567890",
          securityQuestion: securityQuestions[0].value,
          privateKey: "",
        });
        draftsStore.create({
          original,
          id: multisigDraftId,
        });
      }
    }, [draft, chainStore, draftsStore, securityQuestions]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return draft ? <>{children}</> : null;
  }),
};

function App({ initialRouteName }: { initialRouteName: string }) {
  return (
    <MultisigDraft.Container>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={initialRouteName}
      >
        <RootStack.Screen
          name={OnboardingRoute.Welcome}
          component={WelcomeScreen}
        />
        <RootStack.Screen
          name={KeyRoute.DeviceKey}
          component={DeviceKeyScreen}
        />
        <RootStack.Screen
          name={KeyRoute.PhoneKeyRequest}
          component={PhoneKeyRequestScreen}
        />
        <RootStack.Screen
          name={KeyRoute.PhoneKeyConfirm}
          component={PhoneKeyConfirmScreen}
        />
        <RootStack.Screen
          name={KeyRoute.SocialKey}
          component={SocialKeyScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        <RootStack.Screen
          name={KeyRoute.NfcKey}
          component={NfcKeyScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        <RootStack.Screen name={KeyRoute.CloudKey} component={CloudKeyScreen} />
        <RootStack.Screen name={KeyRoute.EmailKey} component={EmailKeyScreen} />
        <RootStack.Screen
          name={OnboardingRoute.CreateWallet}
          component={CreateWalletScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        <RootStack.Screen
          name={OnboardingRoute.LookupProxyWallets}
          component={LookupProxyWalletsScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        <RootStack.Screen
          name={OnboardingRoute.SelectRecoveryMethod}
          component={SelectRecoveryMethodScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        <RootStack.Screen
          name={HomeBottomTabRoute.Accounts}
          component={AccountsScreen}
        />
        <RootStack.Screen
          name={OnboardingRoute.EmailRecovery}
          component={EmailRecoveryScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
        {settingsScreens()}
      </RootStack.Navigator>
      <Modals />
    </MultisigDraft.Container>
  );
}

const meta: Meta<typeof App> = {
  title: "common/Screens",
  component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Welcome: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.Welcome} />;
  },
};

export const DeviceKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.DeviceKey} />;
  },
};

export const PhoneKeyRequest: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.PhoneKeyRequest} />;
  },
};

export const PhoneKeyConfirm: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.PhoneKeyConfirm} />;
  },
};

export const SocialKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.SocialKey} />;
  },
};

export const NfcKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.NfcKey} />;
  },
};

export const EmailKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.EmailKey} />;
  },
};

export const CloudKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.CloudKey} />;
  },
};

export const CreateWallet: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.CreateWallet} />;
  },
};

export const LookupProxyWallets: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.LookupProxyWallets} />;
  },
};

export const SelectRecoveryMethod: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.SelectRecoveryMethod} />;
  },
};

export const Accounts: Story = {
  render: () => {
    return <App initialRouteName={HomeBottomTabRoute.Accounts} />;
  },
};

export const SessionKey: Story = {
  render: () => {
    return <App initialRouteName={SettingsRoute.OsmosisSettings} />;
  },
};
