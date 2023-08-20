export const getStackupRpcUrls = (
  apiKey: string,
): { paymasterRpcUrl: string; rpcUrl: string } => ({
  paymasterRpcUrl: `https://api.stackup.sh/v1/paymaster/${apiKey}`,
  rpcUrl: `https://api.stackup.sh/v1/node/${apiKey}`,
});
