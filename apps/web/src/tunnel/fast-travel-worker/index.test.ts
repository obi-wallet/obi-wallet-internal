import { Effect } from "effect";
import { expect, test } from "vitest";

import { parseSimulationResponse } from ".";

test("parseSimulationResponse", async () => {
  const response = {
    response: {
      deposit_address: null,
      steps: [
        {
          fromChain: "phoenix-1",
          fromAddress: "0x13BE1aF70FF037d1D3DdBDd16A3eF79C6cBFb2Fd",
          fromToken: "uluna",
          stepType: "IbcDeposit",
          slippage: "5",
        },
        {
          fromChain: "phoenix-1",
          fromAddress: "0x13BE1aF70FF037d1D3DdBDd16A3eF79C6cBFb2Fd",
          fromAmount: "50000000",
          fromToken: "uluna",
          toChain: "noble-1",
          toAddress: "noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm",
          toToken: "uusdc",
          stepType: "Skip",
          slippage: "5",
          enableForecall: true,
          enableExpress: true,
          initSimulation: {
            msgs: [
              {
                multi_chain_msg: {
                  chain_id: "phoenix-1",
                  path: ["phoenix-1", "osmosis-1", "noble-1"],
                  msg: '{"source_port":"transfer","source_channel":"channel-1","token":{"denom":"uluna","amount":"50000000"},"sender":"terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4","receiver":"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u","timeout_height":{},"timeout_timestamp":1737012345581165410,"memo":"{\\"wasm\\":{\\"contract\\":\\"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u\\",\\"msg\\":{\\"swap_and_action\\":{\\"user_swap\\":{\\"swap_exact_asset_in\\":{\\"swap_venue_name\\":\\"osmosis-poolmanager\\",\\"operations\\":[{\\"pool\\":\\"1728\\",\\"denom_in\\":\\"ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9\\",\\"denom_out\\":\\"uosmo\\"},{\\"pool\\":\\"1464\\",\\"denom_in\\":\\"uosmo\\",\\"denom_out\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\"}]}},\\"min_asset\\":{\\"native\\":{\\"denom\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\",\\"amount\\":\\"19951269\\"}},\\"timeout_timestamp\\":1737012345581180795,\\"post_swap_action\\":{\\"ibc_transfer\\":{\\"ibc_info\\":{\\"source_channel\\":\\"channel-750\\",\\"receiver\\":\\"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm\\",\\"memo\\":\\"\\",\\"recover_address\\":\\"osmo1k5tu52pjxdt4tddxflfch2kalpmx7yuega29r8\\"}}},\\"affiliates\\":[]}}}}"}',
                  msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
                },
              },
            ],
            txs: [
              {
                cosmos_tx: {
                  chain_id: "phoenix-1",
                  path: ["phoenix-1", "osmosis-1", "noble-1"],
                  msgs: [
                    {
                      msg: '{"source_port":"transfer","source_channel":"channel-1","token":{"denom":"uluna","amount":"50000000"},"sender":"terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4","receiver":"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u","timeout_height":{},"timeout_timestamp":1737012345581165410,"memo":"{\\"wasm\\":{\\"contract\\":\\"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u\\",\\"msg\\":{\\"swap_and_action\\":{\\"user_swap\\":{\\"swap_exact_asset_in\\":{\\"swap_venue_name\\":\\"osmosis-poolmanager\\",\\"operations\\":[{\\"pool\\":\\"1728\\",\\"denom_in\\":\\"ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9\\",\\"denom_out\\":\\"uosmo\\"},{\\"pool\\":\\"1464\\",\\"denom_in\\":\\"uosmo\\",\\"denom_out\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\"}]}},\\"min_asset\\":{\\"native\\":{\\"denom\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\",\\"amount\\":\\"19951269\\"}},\\"timeout_timestamp\\":1737012345581180795,\\"post_swap_action\\":{\\"ibc_transfer\\":{\\"ibc_info\\":{\\"source_channel\\":\\"channel-750\\",\\"receiver\\":\\"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm\\",\\"memo\\":\\"\\",\\"recover_address\\":\\"osmo1k5tu52pjxdt4tddxflfch2kalpmx7yuega29r8\\"}}},\\"affiliates\\":[]}}}}"}',
                      msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
                    },
                  ],
                  signer_address:
                    "terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4",
                },
                operations_indices: [0, 1, 2],
              },
            ],
            route: {
              source_asset_denom: "uluna",
              source_asset_chain_id: "phoenix-1",
              dest_asset_denom: "uusdc",
              dest_asset_chain_id: "noble-1",
              amount_in: "50000000",
              amount_out: "21001335",
              operations: [
                {
                  transfer: {
                    port: "transfer",
                    channel: "channel-1",
                    from_chain_id: "phoenix-1",
                    to_chain_id: "osmosis-1",
                    pfm_enabled: true,
                    supports_memo: true,
                    denom_in: "uluna",
                    denom_out:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                    bridge_id: "IBC",
                    smart_relay: false,
                    chain_id: "phoenix-1",
                    dest_denom:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                  },
                  tx_index: 0,
                  amount_in: "50000000",
                  amount_out: "50000000",
                },
                {
                  swap: {
                    swap_in: {
                      swap_venue: {
                        name: "osmosis-poolmanager",
                        chain_id: "osmosis-1",
                        logo_uri:
                          "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                      },
                      swap_operations: [
                        {
                          pool: "1728",
                          denom_in:
                            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                          denom_out: "uosmo",
                        },
                        {
                          pool: "1464",
                          denom_in: "uosmo",
                          denom_out:
                            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                        },
                      ],
                      swap_amount_in: "50000000",
                      price_impact_percent: "0.5296",
                      estimated_amount_out: "21001335",
                    },
                    estimated_affiliate_fee:
                      "0ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    from_chain_id: "osmosis-1",
                    chain_id: "osmosis-1",
                    denom_in:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                    denom_out:
                      "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    swap_venues: [
                      {
                        name: "osmosis-poolmanager",
                        chain_id: "osmosis-1",
                        logo_uri:
                          "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                      },
                    ],
                  },
                  tx_index: 0,
                  amount_in: "50000000",
                  amount_out: "21001335",
                },
                {
                  transfer: {
                    port: "transfer",
                    channel: "channel-750",
                    from_chain_id: "osmosis-1",
                    to_chain_id: "noble-1",
                    pfm_enabled: true,
                    supports_memo: true,
                    denom_in:
                      "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    denom_out: "uusdc",
                    bridge_id: "IBC",
                    smart_relay: false,
                    chain_id: "osmosis-1",
                    dest_denom: "uusdc",
                  },
                  tx_index: 0,
                  amount_in: "21001335",
                  amount_out: "21001335",
                },
              ],
              chain_ids: ["phoenix-1", "osmosis-1", "noble-1"],
              does_swap: true,
              estimated_amount_out: "21001335",
              swap_venues: [
                {
                  name: "osmosis-poolmanager",
                  chain_id: "osmosis-1",
                  logo_uri:
                    "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                },
              ],
              txs_required: 1,
              usd_amount_in: "21.10",
              usd_amount_out: "21.00",
              swap_price_impact_percent: "0.5296",
              estimated_fees: [],
              required_chain_addresses: ["phoenix-1", "osmosis-1", "noble-1"],
              estimated_route_duration_seconds: 60,
              swap_venue: {
                name: "osmosis-poolmanager",
                chain_id: "osmosis-1",
                logo_uri:
                  "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
              },
            },
          },
        },
        {
          fromChain: "noble-1",
          fromAddress: "noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm",
          fromAmount: "21001335",
          fromToken: "uusdc",
          toChain: "solana",
          toAddress: "48gZ2SHMa2cECuo4BYeiKVk5RR9PoxVrnxGxUnK3f3Cj",
          toToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          stepType: "Skip",
          slippage: "5",
          enableForecall: true,
          enableExpress: true,
          initSimulation: {
            msgs: [],
            txs: [
              {
                cosmos_tx: {
                  chain_id: "noble-1",
                  path: ["noble-1", "solana"],
                  msgs: [
                    {
                      msg: '{"from":"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm","amount":"20072117","destination_domain":5,"mint_recipient":"m+dxt9CL4mBdBesP8d1yUTsXS1tVaTw2hvKkuBeZkWw=","burn_token":"uusdc","destination_caller":"T6iiTX0dDAj20/FvjjtLKCjtLcy5XQ4dTO6NFHPaG1U="}',
                      msg_type_url:
                        "/circle.cctp.v1.MsgDepositForBurnWithCaller",
                    },
                    {
                      msg: '{"from_address":"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm","to_address":"noble1dyw0geqa2cy0ppdjcxfpzusjpwmq85r5a35hqe","amount":[{"denom":"uusdc","amount":"929218"}]}',
                      msg_type_url: "/cosmos.bank.v1beta1.MsgSend",
                    },
                  ],
                  signer_address:
                    "noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm",
                },
                operations_indices: [0],
              },
            ],
            route: {
              source_asset_denom: "uusdc",
              source_asset_chain_id: "noble-1",
              dest_asset_denom: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              dest_asset_chain_id: "solana",
              amount_in: "21001335",
              amount_out: "20072117",
              operations: [
                {
                  cctp_transfer: {
                    from_chain_id: "noble-1",
                    to_chain_id: "solana",
                    burn_token: "uusdc",
                    denom_in: "uusdc",
                    denom_out: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    bridge_id: "CCTP",
                    smart_relay: true,
                    smart_relay_fee_quote: {
                      fee_amount: "929218",
                      relayer_address:
                        "6MxMEeH2MQTjk7Cd4JDbJSnTvtpoKJuv374KpQYKJ3Rv",
                      expiration: "2025-01-16T07:50:38Z",
                      fee_denom: "uusdc",
                      fee_payment_address:
                        "noble1dyw0geqa2cy0ppdjcxfpzusjpwmq85r5a35hqe",
                    },
                  },
                  tx_index: 0,
                  amount_in: "21001335",
                  amount_out: "20072117",
                },
              ],
              chain_ids: ["noble-1", "solana"],
              does_swap: false,
              estimated_amount_out: "20072117",
              swap_venues: [],
              txs_required: 1,
              usd_amount_in: "21.00",
              usd_amount_out: "20.07",
              estimated_fees: [
                {
                  fee_type: "SMART_RELAY",
                  bridge_id: "CCTP",
                  amount: "929218",
                  usd_amount: "0.93",
                  origin_asset: {
                    denom: "uusdc",
                    chain_id: "noble-1",
                    origin_denom: "uusdc",
                    origin_chain_id: "noble-1",
                    trace: "",
                    is_cw20: false,
                    is_evm: false,
                    is_svm: false,
                    symbol: "USDC",
                    name: "USDC",
                    logo_uri:
                      "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png",
                    decimals: 6,
                    description: "USD Coin",
                    coingecko_id: "usd-coin",
                    recommended_symbol: "USDC",
                  },
                  chain_id: "noble-1",
                  tx_index: 0,
                },
              ],
              required_chain_addresses: ["noble-1", "solana"],
              estimated_route_duration_seconds: 120,
            },
          },
        },
        {
          fromChain: "solana",
          fromAddress: "48gZ2SHMa2cECuo4BYeiKVk5RR9PoxVrnxGxUnK3f3Cj",
          fromAmount: "20072117",
          fromToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          toChain: "solana",
          toAddress: "48gZ2SHMa2cECuo4BYeiKVk5RR9PoxVrnxGxUnK3f3Cj",
          toToken: "DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
          stepType: "JupiterSwap",
          slippage: "5",
          initSimulation: [
            {
              swapInfo: {
                ammKey: "4hU85FZ7M9ahgL54FfAvapJwKAiQpzGpUwHt1SbkVwqC",
                label: "Stabble Stable Swap",
                inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                outputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                inAmount: "20072117",
                outAmount: "20074915",
                feeAmount: "200",
                feeMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
              },
              percent: 100,
            },
            {
              swapInfo: {
                ammKey: "B6LL9aCWVuo1tTcJoYvCTDqYrq1vjMfci8uHxsm4UxTR",
                label: "Whirlpool",
                inputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                outputMint: "So11111111111111111111111111111111111111112",
                inAmount: "20074915",
                outAmount: "98980087",
                feeAmount: "1304",
                feeMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
              },
              percent: 100,
            },
            {
              swapInfo: {
                ammKey: "7AbDK9VFPbnDMVwwMEZCuHmBkuCuPRUQhJquE3bMaWSb",
                label: "Raydium",
                inputMint: "So11111111111111111111111111111111111111112",
                outputMint: "DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
                inAmount: "98980087",
                outAmount: "1362988599",
                feeAmount: "247450",
                feeMint: "So11111111111111111111111111111111111111112",
              },
              percent: 100,
            },
          ],
        },
        {
          fromChain: "solana",
          fromAddress: "0x13BE1aF70FF037d1D3DdBDd16A3eF79C6cBFb2Fd",
          fromToken: "DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
          toChain: "solana",
          toAddress: "0x13BE1aF70FF037d1D3DdBDd16A3eF79C6cBFb2Fd",
          toToken: "DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
          stepType: "FinalTransfer",
          slippage: "5",
        },
      ],
    },
    simulationOutput: {
      HybridStrategy: [
        {
          SkipStrategy: {
            msgs: [
              {
                multi_chain_msg: {
                  chain_id: "phoenix-1",
                  path: ["phoenix-1", "osmosis-1", "noble-1"],
                  msg: '{"source_port":"transfer","source_channel":"channel-1","token":{"denom":"uluna","amount":"50000000"},"sender":"terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4","receiver":"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u","timeout_height":{},"timeout_timestamp":1737012345581165410,"memo":"{\\"wasm\\":{\\"contract\\":\\"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u\\",\\"msg\\":{\\"swap_and_action\\":{\\"user_swap\\":{\\"swap_exact_asset_in\\":{\\"swap_venue_name\\":\\"osmosis-poolmanager\\",\\"operations\\":[{\\"pool\\":\\"1728\\",\\"denom_in\\":\\"ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9\\",\\"denom_out\\":\\"uosmo\\"},{\\"pool\\":\\"1464\\",\\"denom_in\\":\\"uosmo\\",\\"denom_out\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\"}]}},\\"min_asset\\":{\\"native\\":{\\"denom\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\",\\"amount\\":\\"19951269\\"}},\\"timeout_timestamp\\":1737012345581180795,\\"post_swap_action\\":{\\"ibc_transfer\\":{\\"ibc_info\\":{\\"source_channel\\":\\"channel-750\\",\\"receiver\\":\\"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm\\",\\"memo\\":\\"\\",\\"recover_address\\":\\"osmo1k5tu52pjxdt4tddxflfch2kalpmx7yuega29r8\\"}}},\\"affiliates\\":[]}}}}"}',
                  msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
                },
              },
            ],
            txs: [
              {
                cosmos_tx: {
                  chain_id: "phoenix-1",
                  path: ["phoenix-1", "osmosis-1", "noble-1"],
                  msgs: [
                    {
                      msg: '{"source_port":"transfer","source_channel":"channel-1","token":{"denom":"uluna","amount":"50000000"},"sender":"terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4","receiver":"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u","timeout_height":{},"timeout_timestamp":1737012345581165410,"memo":"{\\"wasm\\":{\\"contract\\":\\"osmo10a3k4hvk37cc4hnxctw4p95fhscd2z6h2rmx0aukc6rm8u9qqx9smfsh7u\\",\\"msg\\":{\\"swap_and_action\\":{\\"user_swap\\":{\\"swap_exact_asset_in\\":{\\"swap_venue_name\\":\\"osmosis-poolmanager\\",\\"operations\\":[{\\"pool\\":\\"1728\\",\\"denom_in\\":\\"ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9\\",\\"denom_out\\":\\"uosmo\\"},{\\"pool\\":\\"1464\\",\\"denom_in\\":\\"uosmo\\",\\"denom_out\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\"}]}},\\"min_asset\\":{\\"native\\":{\\"denom\\":\\"ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4\\",\\"amount\\":\\"19951269\\"}},\\"timeout_timestamp\\":1737012345581180795,\\"post_swap_action\\":{\\"ibc_transfer\\":{\\"ibc_info\\":{\\"source_channel\\":\\"channel-750\\",\\"receiver\\":\\"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm\\",\\"memo\\":\\"\\",\\"recover_address\\":\\"osmo1k5tu52pjxdt4tddxflfch2kalpmx7yuega29r8\\"}}},\\"affiliates\\":[]}}}}"}',
                      msg_type_url: "/ibc.applications.transfer.v1.MsgTransfer",
                    },
                  ],
                  signer_address:
                    "terra1k5tu52pjxdt4tddxflfch2kalpmx7yuexzr4h4",
                },
                operations_indices: [0, 1, 2],
              },
            ],
            route: {
              source_asset_denom: "uluna",
              source_asset_chain_id: "phoenix-1",
              dest_asset_denom: "uusdc",
              dest_asset_chain_id: "noble-1",
              amount_in: "50000000",
              amount_out: "21001335",
              operations: [
                {
                  transfer: {
                    port: "transfer",
                    channel: "channel-1",
                    from_chain_id: "phoenix-1",
                    to_chain_id: "osmosis-1",
                    pfm_enabled: true,
                    supports_memo: true,
                    denom_in: "uluna",
                    denom_out:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                    bridge_id: "IBC",
                    smart_relay: false,
                    chain_id: "phoenix-1",
                    dest_denom:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                  },
                  tx_index: 0,
                  amount_in: "50000000",
                  amount_out: "50000000",
                },
                {
                  swap: {
                    swap_in: {
                      swap_venue: {
                        name: "osmosis-poolmanager",
                        chain_id: "osmosis-1",
                        logo_uri:
                          "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                      },
                      swap_operations: [
                        {
                          pool: "1728",
                          denom_in:
                            "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                          denom_out: "uosmo",
                        },
                        {
                          pool: "1464",
                          denom_in: "uosmo",
                          denom_out:
                            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                        },
                      ],
                      swap_amount_in: "50000000",
                      price_impact_percent: "0.5296",
                      estimated_amount_out: "21001335",
                    },
                    estimated_affiliate_fee:
                      "0ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    from_chain_id: "osmosis-1",
                    chain_id: "osmosis-1",
                    denom_in:
                      "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
                    denom_out:
                      "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    swap_venues: [
                      {
                        name: "osmosis-poolmanager",
                        chain_id: "osmosis-1",
                        logo_uri:
                          "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                      },
                    ],
                  },
                  tx_index: 0,
                  amount_in: "50000000",
                  amount_out: "21001335",
                },
                {
                  transfer: {
                    port: "transfer",
                    channel: "channel-750",
                    from_chain_id: "osmosis-1",
                    to_chain_id: "noble-1",
                    pfm_enabled: true,
                    supports_memo: true,
                    denom_in:
                      "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                    denom_out: "uusdc",
                    bridge_id: "IBC",
                    smart_relay: false,
                    chain_id: "osmosis-1",
                    dest_denom: "uusdc",
                  },
                  tx_index: 0,
                  amount_in: "21001335",
                  amount_out: "21001335",
                },
              ],
              chain_ids: ["phoenix-1", "osmosis-1", "noble-1"],
              does_swap: true,
              estimated_amount_out: "21001335",
              swap_venues: [
                {
                  name: "osmosis-poolmanager",
                  chain_id: "osmosis-1",
                  logo_uri:
                    "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
                },
              ],
              txs_required: 1,
              usd_amount_in: "21.10",
              usd_amount_out: "21.00",
              swap_price_impact_percent: "0.5296",
              estimated_fees: [],
              required_chain_addresses: ["phoenix-1", "osmosis-1", "noble-1"],
              estimated_route_duration_seconds: 60,
              swap_venue: {
                name: "osmosis-poolmanager",
                chain_id: "osmosis-1",
                logo_uri:
                  "https://raw.githubusercontent.com/skip-mev/skip-go-registry/main/swap-venues/osmosis/logo.png",
              },
            },
          },
        },
        {
          SkipStrategy: {
            msgs: [],
            txs: [
              {
                cosmos_tx: {
                  chain_id: "noble-1",
                  path: ["noble-1", "solana"],
                  msgs: [
                    {
                      msg: '{"from":"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm","amount":"20072117","destination_domain":5,"mint_recipient":"m+dxt9CL4mBdBesP8d1yUTsXS1tVaTw2hvKkuBeZkWw=","burn_token":"uusdc","destination_caller":"T6iiTX0dDAj20/FvjjtLKCjtLcy5XQ4dTO6NFHPaG1U="}',
                      msg_type_url:
                        "/circle.cctp.v1.MsgDepositForBurnWithCaller",
                    },
                    {
                      msg: '{"from_address":"noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm","to_address":"noble1dyw0geqa2cy0ppdjcxfpzusjpwmq85r5a35hqe","amount":[{"denom":"uusdc","amount":"929218"}]}',
                      msg_type_url: "/cosmos.bank.v1beta1.MsgSend",
                    },
                  ],
                  signer_address:
                    "noble1k5tu52pjxdt4tddxflfch2kalpmx7yueg9vadm",
                },
                operations_indices: [0],
              },
            ],
            route: {
              source_asset_denom: "uusdc",
              source_asset_chain_id: "noble-1",
              dest_asset_denom: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              dest_asset_chain_id: "solana",
              amount_in: "21001335",
              amount_out: "20072117",
              operations: [
                {
                  cctp_transfer: {
                    from_chain_id: "noble-1",
                    to_chain_id: "solana",
                    burn_token: "uusdc",
                    denom_in: "uusdc",
                    denom_out: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    bridge_id: "CCTP",
                    smart_relay: true,
                    smart_relay_fee_quote: {
                      fee_amount: "929218",
                      relayer_address:
                        "6MxMEeH2MQTjk7Cd4JDbJSnTvtpoKJuv374KpQYKJ3Rv",
                      expiration: "2025-01-16T07:50:38Z",
                      fee_denom: "uusdc",
                      fee_payment_address:
                        "noble1dyw0geqa2cy0ppdjcxfpzusjpwmq85r5a35hqe",
                    },
                  },
                  tx_index: 0,
                  amount_in: "21001335",
                  amount_out: "20072117",
                },
              ],
              chain_ids: ["noble-1", "solana"],
              does_swap: false,
              estimated_amount_out: "20072117",
              swap_venues: [],
              txs_required: 1,
              usd_amount_in: "21.00",
              usd_amount_out: "20.07",
              estimated_fees: [
                {
                  fee_type: "SMART_RELAY",
                  bridge_id: "CCTP",
                  amount: "929218",
                  usd_amount: "0.93",
                  origin_asset: {
                    denom: "uusdc",
                    chain_id: "noble-1",
                    origin_denom: "uusdc",
                    origin_chain_id: "noble-1",
                    trace: "",
                    is_cw20: false,
                    is_evm: false,
                    is_svm: false,
                    symbol: "USDC",
                    name: "USDC",
                    logo_uri:
                      "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png",
                    decimals: 6,
                    description: "USD Coin",
                    coingecko_id: "usd-coin",
                    recommended_symbol: "USDC",
                  },
                  chain_id: "noble-1",
                  tx_index: 0,
                },
              ],
              required_chain_addresses: ["noble-1", "solana"],
              estimated_route_duration_seconds: 120,
            },
          },
        },
        {
          JupiterSwapStrategy: [
            {
              swapInfo: {
                ammKey: "4hU85FZ7M9ahgL54FfAvapJwKAiQpzGpUwHt1SbkVwqC",
                label: "Stabble Stable Swap",
                inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                outputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                inAmount: "20072117",
                outAmount: "20074915",
                feeAmount: "200",
                feeMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
              },
              percent: 100,
            },
            {
              swapInfo: {
                ammKey: "B6LL9aCWVuo1tTcJoYvCTDqYrq1vjMfci8uHxsm4UxTR",
                label: "Whirlpool",
                inputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                outputMint: "So11111111111111111111111111111111111111112",
                inAmount: "20074915",
                outAmount: "98980087",
                feeAmount: "1304",
                feeMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
              },
              percent: 100,
            },
            {
              swapInfo: {
                ammKey: "7AbDK9VFPbnDMVwwMEZCuHmBkuCuPRUQhJquE3bMaWSb",
                label: "Raydium",
                inputMint: "So11111111111111111111111111111111111111112",
                outputMint: "DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
                inAmount: "98980087",
                outAmount: "1362988599",
                feeAmount: "247450",
                feeMint: "So11111111111111111111111111111111111111112",
              },
              percent: 100,
            },
          ],
        },
      ],
    },
  };
  expect(Effect.runSync(parseSimulationResponse(response))).toEqual({
    depositAddress: null,
    toRawAmount: "1362988599",
  });
});
