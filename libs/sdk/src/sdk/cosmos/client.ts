import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";

import { CosmosChain } from "../../chains";
import {
  withCosmosClients,
  withCosmosCosmWasmClient,
  withCosmosSigningStargateClient,
  withCosmosStargateClient,
} from "../../clients";

export class CosmosClient {
  public constructor(protected chainId: CosmosChain) {}

  public withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    return withCosmosCosmWasmClient(this.chainId, f);
  }

  public withStargateClient<T>(f: (client: StargateClient) => T) {
    return withCosmosStargateClient(this.chainId, f);
  }

  public withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => T
  ) {
    return withCosmosSigningStargateClient(
      { chainId: this.chainId, signer },
      f
    );
  }

  public withClients<T>(
    f: (clients: {
      stargateClient: StargateClient;
      cosmWasmClient: CosmWasmClient;
    }) => T
  ) {
    return withCosmosClients(this.chainId, f);
  }
}
