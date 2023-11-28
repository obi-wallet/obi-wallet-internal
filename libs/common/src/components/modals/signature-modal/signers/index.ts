import { stringToPath } from "@cosmjs/crypto";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import BluetoothTransport from "@ledgerhq/hw-transport-web-ble";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import {
  ChainId,
  CommunicationType,
  getDevicePrivateKey,
  getOrCreateDeviceKeyPair,
  KeySubclassTypeMapping,
  KeyType,
  MultisigKey,
  PhoneKeySigner as AbstractPhoneKeySigner,
  Secp256k1PrivateKeySigner,
  Signer,
  TwilioClientInterface,
  ZAuthKeySigner,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

import { NfcKeySigner } from "./nfc-key-signer";
import { Env } from "../../../../contexts";
import { getTwilioClient } from "../../../../keys";

export async function createUsableSigners({
  multisigKey,
  demoMode,
  env,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  openBottomSheet: () => void;
  env: Env;
}) {
  const possibleUsableKeys = [
    KeyType.Cloud,
    KeyType.Device,
    KeyType.EmailRecovery,
    KeyType.Nfc,
    KeyType.Phone,
    KeyType.Unity,
    KeyType.Ledger,
  ];
  return (
    await Promise.all(
      possibleUsableKeys.map(async (type) => {
        const key = multisigKey.getUsableKeyOfType(type);
        if (!key) return null;
        const signer = await createUsableSigner({
          multisigKey,
          demoMode,
          key,
          env,
        });
        return {
          key,
          signer,
        };
      }),
    )
  ).filter(
    (
      result,
    ): result is { key: KeySubclassTypeMapping[KeyType]; signer: Signer } => {
      return !!result?.signer;
    },
  );
}

async function createUsableSigner({
  multisigKey,
  demoMode,
  key,
  env,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  key: KeySubclassTypeMapping[KeyType];
  env: Env;
}): Promise<Signer | null> {
  switch (key.type) {
    case KeyType.Cloud:
      return new Secp256k1PrivateKeySigner(key.payload.privateKey);
    case KeyType.Device: {
      console.log("switching on key type to KeyType.Device");
      if (!(await getDevicePrivateKey(key))) {
        return null;
      }
      console.log("getDevicePrivateKey skipped/complete");
      return new DeviceKeySigner(key);
    }
    case KeyType.EmailRecovery:
      return new Secp256k1PrivateKeySigner(key.payload.privateKey);
    case KeyType.Nfc:
      return new NfcKeySigner({
        key,
        demoMode,
      });
    case KeyType.Phone:
      return new PhoneKeySigner({
        key: key,
        chainId: multisigKey.chainId,
        demoMode,
        env,
      });
    case KeyType.Unity: {
      return new DeviceKeySigner(key);
    }
    case KeyType.ZAuth:
      return new ZAuthKeySigner(key);
    case KeyType.Ledger:
      return new LedgerKeySigner(key);
    default:
      return null;
  }
}

export class DeviceKeySigner extends Signer {
  public constructor(
    protected key:
      | KeySubclassTypeMapping[KeyType.Device]
      | KeySubclassTypeMapping[KeyType.Unity],
  ) {
    super();
  }

  public get publicKey() {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    console.log("trying to signHash() in DeviceKeySigner");
    if (!this.key.payload.privateKey) {
      // TODO: unity key check if both
      const isUVPAA =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (isUVPAA) {
        const [kp, _] = await getOrCreateDeviceKeyPair(false, false);
        invariant(kp, "device keypair not obtained");
        return new Secp256k1PrivateKeySigner(kp.privateKey).signHash(hash);
      } else {
        invariant(
          this.key.type === KeyType.Device,
          "trying to sign with unity key without private key",
        );
        const privateKey = await getDevicePrivateKey(this.key);
        invariant(privateKey, "Expected private key to exist.");
        return new Secp256k1PrivateKeySigner(privateKey).signHash(hash);
      }
    } else {
      // unity or otherwise session-stored keypair
      return new Secp256k1PrivateKeySigner(
        this.key.payload.privateKey,
      ).signHash(hash);
    }
  }
}

// TODO: Finish this key signer to use it as other keys

export class LedgerKeySigner extends Signer {
  public constructor(protected key: KeySubclassTypeMapping[KeyType.Ledger]) {
    super();
  }

  public get publicKey() {
    return this.key.publicKey;
  }

  public async getTransport() {}

  public async getSigner() {}

  public async signHash(hash: Uint8Array) {
    console.log("LEDGER HASH", hash);
  }
}

export class PhoneKeySigner extends Signer {
  protected signer: AbstractPhoneKeySigner;
  protected twilioClient: TwilioClientInterface;
  protected chainId: ChainId;

  public constructor({
    key,
    chainId,
    demoMode,
    env,
  }: {
    key: KeySubclassTypeMapping[KeyType.Phone];
    chainId: ChainId;
    demoMode: boolean;
    env: Env;
  }) {
    super();
    this.signer = new AbstractPhoneKeySigner(key);
    this.twilioClient = getTwilioClient({ demoMode, env });
    this.chainId = chainId;
  }

  public async signHash(hash: Uint8Array) {
    return await this.signer.signHash(hash);
  }

  public get publicKey() {
    return this.signer.publicKey;
  }

  public async requestSignature({
    securityAnswer,
    type,
  }: {
    securityAnswer: string;
    type: CommunicationType;
  }) {
    await this.signer.requestSignature({
      chainId: this.chainId,
      securityAnswer,
      twilioClient: this.twilioClient,
      type,
    });
  }

  public async confirmSignature(key: string) {
    await this.signer.confirmSignature({
      chainId: this.chainId,
      key,
      twilioClient: this.twilioClient,
    });
  }

  public cancelSignature() {
    this.signer.cancelSignature();
  }
}

export async function createDeviceKeySigner({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const deviceKey = multisigKey.getUsableKeyOfType(KeyType.Device);
  invariant(deviceKey, "Expected device key to exist.");
  return new DeviceKeySigner(deviceKey);
}

// export async function isWebUsbTransportSupported() {
//   try {
//     return TransportWebUSB.isSupported();
//   } catch {
//     return false;
//   }
// }

export async function isBleTransportSupported() {
  try {
    return navigator?.bluetooth.getAvailability();
  } catch {
    return false;
  }
}

enum CoinTypes {
  SECRET = 529,
  COSMOS = 118,
  TERRA = 330,
}

export function getHdPath(
  accountNumber: number = 0,
  coinType: CoinTypes = CoinTypes.COSMOS,
) {
  return `m/44'/${coinType}/0'/0/${accountNumber}`;
}

export async function getLedgerSinger(accountNumber: number = 0) {
  const transport = (await isBleTransportSupported())
    ? await BluetoothTransport.create()
    : await TransportWebUSB.create();

  const hdPath = stringToPath(getHdPath(accountNumber, CoinTypes.SECRET));
  const ledgerAppName = "Secret";
  const ledgerSigner = new LedgerSigner(transport, {
    ledgerAppName,
    hdPaths: [hdPath],
    prefix: "secret",
  });
  const accounts = await ledgerSigner.getAccounts();

  return {
    ledgerSigner,
    accounts,
  };
}
