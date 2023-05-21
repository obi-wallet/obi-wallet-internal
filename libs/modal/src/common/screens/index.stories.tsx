import {
  CreateWalletScreen,
  DeviceKeyScreen,
  getTwilioClient,
  KeyRoute,
  OnboardingRoute,
  PhoneKeyConfirmScreen,
  PhoneKeyRequestScreen,
  RootStack,
  useEnv,
  useSecurityQuestions,
  useStore,
  WelcomeScreen,
} from "@obi-wallet/common";
import { ObservableMultisigKey } from "@obi-wallet/sdk";
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
    const { chainStore, draftsStore } = useStore();
    const draft = draftsStore.get({ id: multisigDraftId });
    const securityQuestions = useSecurityQuestions();
    const env = useEnv();

    useAsyncEffect(async () => {
      if (!draft) {
        const original = ObservableMultisigKey.create(chainStore.currentChain);
        // TODO: doesn't work in web yet
        // original.setDeviceKey({
        //   type: pubkeyType.secp256k1,
        //   value: await getBiometricsPublicKey({
        //     demoMode: true,
        //   }),
        // });
        original.setPhoneKey({
          publicKey: await getTwilioClient({
            demoMode: true,
            env,
          }).parsePublicKeyTextMessageResponse({
            key: "",
          }),
          phoneNumber: "+1234567890",
          securityQuestion: securityQuestions[0].value,
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
          name={OnboardingRoute.CreateWallet}
          component={CreateWalletScreen}
          initialParams={{
            draftId: MultisigDraft.draftId,
          }}
        />
      </RootStack.Navigator>
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

export const CreateWallet: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.CreateWallet} />;
  },
};
