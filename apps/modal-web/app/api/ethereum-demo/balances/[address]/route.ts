import { useStore } from "@obi-wallet/common";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import Web3 from "web3";

const web3 = new Web3(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER_URL!),
);

const ztxToken = "0xf0F8FC7365C0c9F87189B6c8703e4719270A3318";

export async function GET(
  request: Request,
  { params }: { params: { address: string } },
) {
  const { walletsStore } = useStore();
  const evmAddress = walletsStore.currentWallet?.evmAddress;
  invariant(evmAddress, "evm address not set");
  const balances = await fetchBalances(walletsStore.currentWallet?.evmAddress);
  return NextResponse.json(balances);
}

async function fetchBalances(address: string) {
  const [ztxResult, ethResult] = await Promise.all([
    fetchTokenBalance({ id: ztxToken, address }),
    web3.eth.getBalance(address),
  ]);

  return [
    {
      id: ztxToken,
      rawAmount: ztxResult.toString(),
    },
    {
      id: "eth",
      rawAmount: ethResult.toString(),
    },
  ];
}

async function fetchTokenBalance({
  id,
  address,
}: {
  id: string;
  address: string;
}): Promise<bigint> {
  const tokenContract = new web3.eth.Contract(
    [
      {
        constant: true,
        inputs: [
          {
            name: "account",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      } as const,
    ],
    id,
  );
  return await tokenContract.methods.balanceOf(address).call();
}
