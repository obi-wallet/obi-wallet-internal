import { NextResponse } from "next/server";
import Web3 from "web3";

const web3 = new Web3(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER_URL!)
);

const ztxToken = "0x5CF29823CCFC73008fa53630d54A424AB82dE6F2";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const balances = await fetchBalances(params.address);
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
    id
  );
  return await tokenContract.methods.balanceOf(address).call();
}
