"use client";

import { useStore } from "@/contexts";
import { NewOnboardingPayload } from "@/onboarding/new-onboarding-payload";
import { TargetChainId } from "@/target-chain";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { decodeSignature } from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import { makeSignBytes } from "@cosmjs/proto-signing";
import {
  credentialToKeyPair,
  MpcWallet,
  MultisigKey,
  SecretJsHomeChainId,
} from "@obi-wallet/sdk";
import { generateSec256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useEffectOnceWhen } from "rooks";
import * as secp256k1 from "secp256k1";

// @refresh reset
export default function DebugPage() {
  const { mpcStore } = useStore();

  useEffectOnceWhen(async () => {
    /* eslint-disable import/no-extraneous-dependencies */
    const [_chai, mocha] = await Promise.all([
      import("chai"),
      // @ts-expect-error Ignore
      import("mocha/mocha.js"),
      // @ts-expect-error Ignore
      import("mocha/mocha.css"),
    ]);
    /* eslint-enable import/no-extraneous-dependencies */
    mocha.setup("tdd");
    mocha.checkLeaks();

    suite("Onboarding", function () {
      test("ofo", () => {
        const keyPair = generateSec256k1KeyPair();
        const uncompressedKeyPair = secp256k1.publicKeyConvert(
          Buffer.from(keyPair.publicKey.value, "base64"),
          false,
        );
        console.log("KP", Buffer.from(uncompressedKeyPair).toString("hex"));
      });

      test("New Onboarding Payload", async function (this: {
        timeout(ms: number): void;
      }) {
        this.timeout(0);
        const credential = {
          id: "BqrGB4NlGTSfryBzlIfrmg",
        };
        const owner = MultisigKey.create(
          undefined,
          SecretJsHomeChainId.MAINNET,
        );
        await owner.setDeviceKey(await credentialToKeyPair(credential));

        const details = {
          homeChain: "secret-4",
          multisigKey: owner.toJSON(),
          ownerConfirmed: true,
          userData: {
            name: "",
            image: "",
          },
          shares: {
            keygenParam: {
              parties: 3,
              threshold: 1,
            },
            backupParticipants: [2, 3],
            networkParticipants: [1, 3],
            easyShare: {
              preSignForNetworkShare: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "f2857457133fb28c97525ff08f5de316a4b30bedc9afd573d13c609d7c838653",
                },
                R: {
                  curve: "secp256k1",
                  point:
                    "03b815d836ea8be34c7662dd2cdd81adc6184699662c975d4e51afa0acabe13e70",
                },
                sigma_i: {
                  curve: "secp256k1",
                  scalar:
                    "311aa85e26c3e41a602da75f8bd01dec8983e2d601aeafc25c5e97598d36cdf4",
                },
                pubkey: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
              preSignForBackupShare: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "5a85d838bc319babfdec0da1aa08a6c9808667329c4de21a3b4af3588d1ea081",
                },
                R: {
                  curve: "secp256k1",
                  point:
                    "02e307c6f8509a48b1c7b58aadaaeb46a64933e634825b4df183c95364434874d8",
                },
                sigma_i: {
                  curve: "secp256k1",
                  scalar:
                    "f3930ad37234d169e799946ac94bfb866967493559d4c1bd0844ff43f4f8be23",
                },
                pubkey: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
            backupShare: {
              sign_keys: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "17ce7b9d1b47d3f79aeb645175af0c8dfcbc13995fe29e89b9bbeab42f081db1",
                },
              },
              R: {
                curve: "secp256k1",
                point:
                  "02e307c6f8509a48b1c7b58aadaaeb46a64933e634825b4df183c95364434874d8",
              },
              sigma_i: {
                curve: "secp256k1",
                scalar:
                  "49da275ed6d2f2e7c3eeaa667626c566e77322598de2acbe5174cfbffe160381",
              },
              local_key: {
                y_sum_s: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
            networkShare: {
              sign_keys: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "bd233ca2c796511e6dcade47dd6ba114ebd3f3aa4d554a62ba279bd797948c0a",
                },
              },
              R: {
                curve: "secp256k1",
                point:
                  "03b815d836ea8be34c7662dd2cdd81adc6184699662c975d4e51afa0acabe13e70",
              },
              sigma_i: {
                curve: "secp256k1",
                scalar:
                  "c28d2d278285d8b4f5c558bbb01dbd50099f3227603d7b27a66e294f2870ff63",
              },
              local_key: {
                y_sum_s: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
          },
          encryptedShares: null,
          distributedShares: true,
          unclaimedHomeAccount: {
            homeAccountAddress: "secret1amx0cvz9qvskrvp73kn66aux2zg7285qyq5v3z",
            ownerAddress: "secret1cr46v57eqvtvlqsqudec2p7qeg73stsurmztcn",
            ownerIndex: 180,
          },
          homeAccountClaimed: true,
        };

        const payload = NewOnboardingPayload.deserialize(details);
        await payload.continueFlow();
        console.log(payload.toJSON());
      });
      test("MPC Wallet", async function (this: { timeout(ms: number): void }) {
        this.timeout(0);
        const details = {
          homeChain: "secret-4",
          multisigKey: {
            keys: [
              {
                type: "device",
                payload: {
                  publicKey: {
                    type: "tendermint/PubKeySecp256k1",
                    value: "AuuQY4Onvw7BxLRki234tjN2HmNSUArGC4G5dvknNZJw",
                  },
                  privateKey: "uIKIj3dfS6oAVSLELI2J+3MIHlRXVX7VGl68oqQtC2Y=",
                },
              },
            ],
            threshold: 1,
            evmSigningAddress: "",
            evmUserContractAddress: "",
          },
          userData: {
            name: "",
            image: "",
          },
          ownerConfirmed: true,
          shares: {
            keygenParam: {
              parties: 3,
              threshold: 1,
            },
            backupParticipants: [2, 3],
            networkParticipants: [1, 3],
            easyShare: {
              preSignForNetworkShare: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "f2857457133fb28c97525ff08f5de316a4b30bedc9afd573d13c609d7c838653",
                },
                R: {
                  curve: "secp256k1",
                  point:
                    "03b815d836ea8be34c7662dd2cdd81adc6184699662c975d4e51afa0acabe13e70",
                },
                sigma_i: {
                  curve: "secp256k1",
                  scalar:
                    "311aa85e26c3e41a602da75f8bd01dec8983e2d601aeafc25c5e97598d36cdf4",
                },
                pubkey: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
              preSignForBackupShare: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "5a85d838bc319babfdec0da1aa08a6c9808667329c4de21a3b4af3588d1ea081",
                },
                R: {
                  curve: "secp256k1",
                  point:
                    "02e307c6f8509a48b1c7b58aadaaeb46a64933e634825b4df183c95364434874d8",
                },
                sigma_i: {
                  curve: "secp256k1",
                  scalar:
                    "f3930ad37234d169e799946ac94bfb866967493559d4c1bd0844ff43f4f8be23",
                },
                pubkey: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
            backupShare: {
              sign_keys: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "17ce7b9d1b47d3f79aeb645175af0c8dfcbc13995fe29e89b9bbeab42f081db1",
                },
              },
              R: {
                curve: "secp256k1",
                point:
                  "02e307c6f8509a48b1c7b58aadaaeb46a64933e634825b4df183c95364434874d8",
              },
              sigma_i: {
                curve: "secp256k1",
                scalar:
                  "49da275ed6d2f2e7c3eeaa667626c566e77322598de2acbe5174cfbffe160381",
              },
              local_key: {
                y_sum_s: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
            networkShare: {
              sign_keys: {
                k_i: {
                  curve: "secp256k1",
                  scalar:
                    "bd233ca2c796511e6dcade47dd6ba114ebd3f3aa4d554a62ba279bd797948c0a",
                },
              },
              R: {
                curve: "secp256k1",
                point:
                  "03b815d836ea8be34c7662dd2cdd81adc6184699662c975d4e51afa0acabe13e70",
              },
              sigma_i: {
                curve: "secp256k1",
                scalar:
                  "c28d2d278285d8b4f5c558bbb01dbd50099f3227603d7b27a66e294f2870ff63",
              },
              local_key: {
                y_sum_s: {
                  curve: "secp256k1",
                  point:
                    "02f4b7c464d9effa077ab7284e97e955d68420f3e9c35893c9d1d2e51e14deed34",
                },
              },
            },
          },
          encryptedShares: {
            easyShare:
              "BP3KM99swtx2pr/Hzjw+3a0AyFp7oAsOZZYm/Pd7yWnUN3q5hqrJ3USz3u8ovdNLeevfG1e1cOUZQC4Zqkf3RxP0kort1lFZxw7wEnxkki6gJHzJdvCGNCQeSwf3B3D2334PFoZ4IaAOVcdmzyKm626JggcymNuNPzuFppc0FhcdFkh9Rlu8ijICdlOVdR7KrpXu02iy6QgD9AFKmPYogL6ClOI18VJWJ8AZi+lRnLvMKcLhIPQHMZ5AUJp2wMFjvRDyg/i0DGSsDTPta9j8xmKaj9DrpjP9LzPbwufW/nYV/E+yJ09UQV2LY0zaC4wFMbBvIlyZbBfjwmzaJ4rJ8wt/MOo4Hr+jwoVHb7fsSNYEwOjW7Pu7Y7yzJ5ACimxZEVKB0uH68pyVtO1spTX8V4OPLtzTUNg5SOI+7RO6VogP067eAceFQ9sgvzv/NVB8bQBge2Oio9KPu+74o4u+eJgXOSPxKIod4vv487ayVLmEkUV/uKlFEWMujHxu+S67Q3m+hcTkSsCmEWfi8BaHtfwZ98qtKfAPzwJueVPt3pyCDxvzMe17wzcUJ6bfh9HqhTXgM/fNsfBahGOJN47Y9Jqkgf/Vg39O/2ekqteuUaPFv74qFMgNffTPX+FAr7Kdpjf4xxP84fPe2bjUI0UeX4qPYbnmcRP8pQa9XdXL091vNO/GZpn+8Dro/6j8oDTyNsa38HGToFuAWXPWVRSwCFPYglPPmYQnxWQKs53Nbv0/Ca1FO9EZMVukUGj2XXWougDt7A+SMKvKvxzetR59QxoVqJEs0WPEeLoeZvSNIeK9tUTvApFLyXMKbg/luxLbyV6FZdQJG7tYmsrv1m6sK7ukf9WyVssPEoriN9EznpI4Lz3LafrhaRqHCmuyDO/8o7BtkY51NoNJPZHZdB+zjw9nP2GU1XUWNFS381u6WJ8rB1RB/O8m0GDU+ZVv1FJKs6giF9GSxnwd2ZEHy4sWxncDCZULEkyXlig6YTlJDnXNJupVoOELybJiI2njIJ0sxPinLEs+I2Ji3pQ9VABK6TuUh1R6ozpEeEbQ3wi6iB2Ij5z0F1uMVqmML/SWMNu+WUiZsKKkfBk8pp9NpndHh3ANAD/3nZjTfq/VE2ki6RiTHyloLW19rapSDbuwj7Mgu1e6pIx7nljAoAS4NC0/yABSlE+P0iqHuhNwl9d1eDL5AdBHuIrLQdvIZLW5IMIwf85C6/MSznUBnuSjZnAWfFtMQVzOuXB383p74QwXDAWjTv/YKXF8a+V923U83LmhHREK0H+h9atc3+i4HopOM/NfMhG9S/L1KSfZa2kYjX/5zLckbQ==",
            backupShare:
              '["Yn6sJ7UsWkebup76VMiszSmr/ZrIHdhW+mWxlg2lJ4fYQxm31gmSDgPzXxd/s3FbBLk+lu5ipAj7ZCqvxLMhxB9uouEfck8cRtmUQDFtoCj0SITYIOIyDZ+Dee3cvPnsoLYrrNUMl4ns7q6le8HYHtvmAEbBYeSK89ImJGxRLvgE1jBiSXU2KJbaXTytbi0mN3wywEG9qeVN/iTLWOjpTQGTG3sJiOKEiWgZLTLxhLwjG0mdllO+F/adK0W2a/7Zsv7bZIrD9trNINLWPHhldQFRhwWBUbraR3eXJyMLSc1OWy6h05XBMaNSiBzlSnqTWj4JsDknH17za0v83BeoAEAPaBVZ+34gwekJ7R85SVhYBYSuDAvTqugIcSvwq7O/dGHvrMSM0JrBoSxJR6ELw66Qh8bZe8KxOGzrVvhXfn1XpKIKIPUYxLNBZqtlXbMPP125tKLklPaoZCd1zrV0wZD8p114K89mKzHlEw/B2ZjSYfvGE2GjHAYJ30W08QgntLL1bsj2hMcgaS4pOiVHt/MBhn5gnbPON1ol97vIRRPGX/gnJUYpZLowXQrffQh8FYHenuxR+aDvHPkPw7GfPNfZz+SP0NseFcAuVZ1cshPBlVRnfRCNA8uEqKjx0waoXA==","BArZy3MQ+3aarVT9PXpSUsgv/xp/t/Vl0u59tCd6rdPEADIri24hhVX0LD1o27YejEXrs2nyh4mWuK96qPVDU6eIv+DSjB3lllT2BHZ7P0N426wDWoaHaaYk9rw/oZ1TGJ/sJxNqMsyKoEX6Tkfrd68HAspgYE6vVXn6Hg33td/oCbvqsJsucCme0YhzMpCSpnl3e4JH7fTXk7V6SotrV4Ez7mzT52szwVZkRMz2URgsdcR/MFnXX5Z+C6zvbC5F1e6epVzYHQiRq21SDBBgAjKyaki/br3KryHViXWT6fdRV2Uc+o0Wkf1OMTyvMUjAbKnlmeEe6PFx"]',
          },
          distributedShares: true,
          unclaimedHomeAccount: {
            homeAccountAddress: "secret1amx0cvz9qvskrvp73kn66aux2zg7285qyq5v3z",
            ownerAddress: "secret1cr46v57eqvtvlqsqudec2p7qeg73stsurmztcn",
            ownerIndex: 180,
          },
          homeAccountClaimed: true,
        };
        const payload = NewOnboardingPayload.deserialize(details);
        const walletData = payload.toMpcWalletData();
        const mpcWallet = MpcWallet.create(walletData);
        const signer = await CosmosSdkMpcSigner.fromWallet(
          mpcWallet,
          TargetChainId.Sei,
        );
        // @ts-expect-error: Intentionally stripped down
        const signDoc: SignDoc = { memo: "foobar" };
        const response = await signer.signDirect(
          (await signer.getAccounts())?.[0]?.address!,
          signDoc,
        );
        const signBytes = makeSignBytes(signDoc);

        console.log(
          secp256k1.ecdsaVerify(
            decodeSignature(response.signature).signature,
            sha256(signBytes),
            (await signer.getAccounts())[0].pubkey,
          ),
        );
      });
    });

    // suite("distributeShares", function () {
    //   test("should succeed", async function (this: {
    //     timeout(ms: number): void;
    //   }) {
    //     this.timeout(0);
    //     console.log(await mpcStore.getShares());
    //   });
    //
    //   test("encrypt shares", async function (this: {
    //     timeout(ms: number): void;
    //   }) {
    //     this.timeout(0);
    //     // const response: Awaited<ReturnType<typeof distributeShares>> = {
    //     //   keygenParam: {
    //     //     parties: 3,
    //     //     threshold: 1,
    //     //   },
    //     //   backupParticipants: [2, 3],
    //     //   contractParticipants: [1, 3],
    //     //   easyShare: {
    //     //     preSignForNetworkShare: {
    //     //       k_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "dea3c648b51f3f78ef82378b6a2cd2b5d9b50ca97609d60a52080fa25fbe791f",
    //     //       },
    //     //       R: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "03dade59dbaa2fc12a358e20f7709f0bce541d0aa2b5ff0aa1073c45b3e0459745",
    //     //       },
    //     //       sigma_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "523620720ddbaad43df9746f72b92862995f9b2c9b7462762f29af13fdce023b",
    //     //       },
    //     //       pubkey: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "021ce77ae3343445205456c51a7a9335a724bc16002438bd020a1ac5bf5e614958",
    //     //       },
    //     //     },
    //     //     preSignForBackupShare: {
    //     //       k_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "dcadda26e331e084c01915e88edd550c03df220dbcc635742cbb843e42891de0",
    //     //       },
    //     //       R: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "031b892a3b515b474f2e4d4bb4eaf89089a0a9eb460babeee66fdce7dc3ee6e0ec",
    //     //       },
    //     //       sigma_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "df39a636d20b7ce61e500906015e9bbe7d729a0e96931fa05e9db29724a86f5c",
    //     //       },
    //     //       pubkey: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "021ce77ae3343445205456c51a7a9335a724bc16002438bd020a1ac5bf5e614958",
    //     //       },
    //     //     },
    //     //   },
    //     //   backupShare: {
    //     //     sign_keys: {
    //     //       k_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "9acbf107e484ebc735e22c40b4a2e27c496a934b522ffc9e855f83c0485ae296",
    //     //       },
    //     //     },
    //     //     R: {
    //     //       curve: "secp256k1",
    //     //       point:
    //     //         "031b892a3b515b474f2e4d4bb4eaf89089a0a9eb460babeee66fdce7dc3ee6e0ec",
    //     //     },
    //     //     sigma_i: {
    //     //       curve: "secp256k1",
    //     //       scalar:
    //     //         "d410b2a2c1528f1e1a1406317b03cacf20f1ce598f3aa934470f2f72d81c513a",
    //     //     },
    //     //     local_key: {
    //     //       y_sum_s: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "021ce77ae3343445205456c51a7a9335a724bc16002438bd020a1ac5bf5e614958",
    //     //       },
    //     //     },
    //     //   },
    //     //   networkShare: {
    //     //     sign_keys: {
    //     //       k_i: {
    //     //         curve: "secp256k1",
    //     //         scalar:
    //     //           "58ddb9e466db22965f0b35ced59a81c68bfe7043ab465bf0217232d87c36730e",
    //     //       },
    //     //     },
    //     //     R: {
    //     //       curve: "secp256k1",
    //     //       point:
    //     //         "03dade59dbaa2fc12a358e20f7709f0bce541d0aa2b5ff0aa1073c45b3e0459745",
    //     //     },
    //     //     sigma_i: {
    //     //       curve: "secp256k1",
    //     //       scalar:
    //     //         "f6f29fd2560b8fba509a5e67c11cbe2db7df244ebfe600606e60d8982dbb1b94",
    //     //     },
    //     //     local_key: {
    //     //       y_sum_s: {
    //     //         curve: "secp256k1",
    //     //         point:
    //     //           "021ce77ae3343445205456c51a7a9335a724bc16002438bd020a1ac5bf5e614958",
    //     //       },
    //     //     },
    //     //   },
    //     // };
    //
    //     const credential = {
    //       id: "BqrGB4NlGTSfryBzlIfrmg",
    //     };
    //
    //     const keyPair = await credentialToKeyPair(credential);
    //     // const encryption = new Secp256k1Encryption(keyPair);
    //     const message = "foo";
    //     // console.log(
    //     //   await encryption.decrypt(await encryption.encrypt(message)),
    //     // );
    //
    //     const multiEncryption = new MultisigKeyEncryption({
    //       type: "tendermint/PubKeyMultisigThreshold",
    //       value: {
    //         threshold: "2",
    //         pubkeys: [keyPair.publicKey, keyPair.publicKey, keyPair.publicKey],
    //       },
    //     });
    //     const encrypted = await multiEncryption.encrypt(message);
    //     const multiDecryption = new MultisigKeyDecryption([
    //       keyPair.privateKey,
    //       null,
    //       keyPair.privateKey,
    //     ]);
    //     const decrypted = await multiDecryption.decrypt(encrypted);
    //     console.log(decrypted);
    //
    //     // TODO:
    //     // async function encrypt(data: string) {
    //     //   const enc = new TextEncoder();
    //     //   const encoded = enc.encode(data);
    //     //   const iv = window.crypto.getRandomValues(new Uint8Array(12));
    //     //   const encrypted = await window.crypto.subtle.encrypt(
    //     //     { name: "AES-GCM", iv: iv },
    //     //     await getEncryptionKey(),
    //     //     encoded,
    //     //   );
    //     //   return new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    //     // }
    //     //
    //     // // TODO:
    //     // async function decrypt(data: Uint8Array) {
    //     //   const iv = data.slice(0, 12);
    //     //   const encrypted = data.slice(12);
    //     //   const decrypted = await window.crypto.subtle.decrypt(
    //     //     { name: "AES-GCM", iv: iv },
    //     //     await getEncryptionKey(),
    //     //     encrypted,
    //     //   );
    //     //   const dec = new TextDecoder();
    //     //   return dec.decode(decrypted);
    //     // }
    //     //
    //     // console.log(response);
    //   });
    // });

    mocha.run();
  });

  return <div id="mocha" className="text-white" />;
}
