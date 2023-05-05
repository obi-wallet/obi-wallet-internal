import { Chain, ChainId } from "../src";

test("Chain.select", () => {
  const f = (chainId: ChainId) => {
    return Chain.select({
      chainId,
      onCosmosChain: () => "onCosmosChain",
      onLegacyCosmosChain: () => "onLegacyCosmosChain",
      onTerraChain: () => "onTerraChain",
    });
  };

  expect(f("oasis-3")).toEqual("onCosmosChain");
  expect(f("uni-3")).toEqual("onLegacyCosmosChain");
  expect(f("juno-1")).toEqual("onLegacyCosmosChain");
  expect(f("pisco-1")).toEqual("onTerraChain");
  expect(f("phoenix-1")).toEqual("onTerraChain");
});
