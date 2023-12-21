import { SignClient } from "@walletconnect/sign-client";
import { getSdkError } from "@walletconnect/utils";
import Web3Wallet from "@walletconnect/web3wallet";

import { setupWalletConnect } from "../src";

const PROJECT_ID = "044348b5f9a15395896ca2661ad9ea10";
const TEST_NAMESPACES = {
  cosmos: {
    chains: ["cosmos:cosmoshub-4"],
    methods: ["cosmos_signDirect"],
    accounts: ["cosmos:cosmoshub-4:foobar"],
    events: [],
  },
};
const TEST_REQUIRED_NAMESPACES = {
  cosmos: {
    chains: ["cosmos:cosmoshub-4"],
    methods: ["cosmos_signDirect"],
    events: [],
  },
};

let wallet: Web3Wallet;
let sessionApproval: () => Promise<unknown>;
let uriString: string;

afterAll(async () => {
  if (wallet.core.relayer.connected) {
    await wallet.core.relayer.transportClose();
  }
});

beforeEach(async () => {
  const dapp = await SignClient.init({ projectId: PROJECT_ID, name: "Dapp" });
  const { uri, approval } = await dapp.connect({
    requiredNamespaces: TEST_REQUIRED_NAMESPACES,
  });
  uriString = uri || "";
  sessionApproval = approval;
  wallet = await setupWalletConnect({
    projectId: PROJECT_ID,
    metadata: {
      name: "foo",
      description: "foo",
      url: "foo",
      icons: [],
    },
  });
});

test("Approve session proposal", async () => {
  await Promise.all([
    new Promise((resolve) => {
      wallet.on("session_proposal", async (sessionProposal) => {
        const { id, params, verifyContext } = sessionProposal;
        expect(verifyContext.verified.validation).toEqual("UNKNOWN");
        expect(verifyContext.verified.isScam).toEqual(undefined);
        const session = await wallet.approveSession({
          id,
          namespaces: TEST_NAMESPACES,
        });
        expect(params.requiredNamespaces).toMatchObject(
          TEST_REQUIRED_NAMESPACES,
        );
        resolve(session);
      });
    }),
    sessionApproval(),
    wallet.pair({ uri: uriString }),
  ]);
});

test("Reject session proposal", async () => {
  const rejectionError = getSdkError("USER_REJECTED");

  await Promise.all([
    new Promise<void>((resolve) => {
      wallet.on("session_proposal", async (sessionProposal) => {
        const { params } = sessionProposal;
        expect(params.requiredNamespaces).toMatchObject(
          TEST_REQUIRED_NAMESPACES,
        );
        await wallet.rejectSession({
          id: params.id,
          reason: rejectionError,
        });
        resolve();
      });
    }),
    // eslint-disable-next-line no-async-promise-executor
    new Promise<void>(async (resolve) => {
      // catch the rejection and compare
      try {
        await sessionApproval();
      } catch (err) {
        expect(err).toMatchObject(rejectionError);
      }
      resolve();
    }),
    wallet.pair({ uri: uriString }),
  ]);
});
