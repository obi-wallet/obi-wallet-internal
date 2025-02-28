import React, { useState, useEffect, useMemo } from 'react';

// Define supported chains with their validation rules and CAIP-19 format
interface ChainConfig {
  id: string;
  name: string;
  icon: string;
  caipNamespace: string;
  caipReference: string;
  tokenStandard?: string;
  validateAddress: (address: string) => boolean;
  addressPlaceholder: string;
}

const CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '🔷',
    caipNamespace: 'eip155',
    caipReference: '1',
    tokenStandard: 'erc20',
    validateAddress: (address: string) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    addressPlaceholder: '0x...',
  },
  {
    id: 'solana',
    name: 'Solana',
    icon: '🟣',
    caipNamespace: 'solana',
    caipReference: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    validateAddress: (address: string) => {
      return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(address);
    },
    addressPlaceholder: 'Solana address...',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: '🔵',
    caipNamespace: 'eip155',
    caipReference: '42161',
    tokenStandard: 'erc20',
    validateAddress: (address: string) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    addressPlaceholder: '0x...',
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔘',
    caipNamespace: 'eip155',
    caipReference: '8453',
    tokenStandard: 'erc20',
    validateAddress: (address: string) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    addressPlaceholder: '0x...',
  },
  {
    id: 'neutron',
    name: 'Neutron',
    icon: '⚛️',
    caipNamespace: 'cosmos',
    caipReference: 'neutron-1',
    validateAddress: (address: string) => {
      return address.startsWith('neutron1') && address.length >= 39 && address.length <= 44;
    },
    addressPlaceholder: 'neutron1...',
  },
  {
    id: 'osmosis',
    name: 'Osmosis',
    icon: '🧪',
    caipNamespace: 'cosmos',
    caipReference: 'osmosis-1',
    validateAddress: (address: string) => {
      return address.startsWith('osmo1') && address.length >= 39 && address.length <= 44;
    },
    addressPlaceholder: 'osmo1...',
  },
];

interface ChainAssetSelectorProps {
  onAssetChange?: (asset: string) => void;
  iframeId?: string;
}

// Using function declaration instead of arrow function for the component
function ChainAssetSelector(props: ChainAssetSelectorProps): React.ReactElement {
  const { onAssetChange, iframeId = 'tunnel-embed' } = props;
  
  // Use the first chain in the list with a guarantee that it exists
  const [selectedChain, setSelectedChain] = useState<ChainConfig>(CHAINS[0]!);
  const [contractAddress, setContractAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Validate address when chain or address changes
  useEffect(() => {
    if (!contractAddress) {
      setIsAddressValid(false);
      setValidationMessage('');
      return;
    }

    const isValid = selectedChain.validateAddress(contractAddress);
    setIsAddressValid(isValid);
    
    if (isValid) {
      setValidationMessage('✅ Valid address');
    } else {
      setValidationMessage(`❌ Invalid ${selectedChain.name} address format`);
    }
  }, [selectedChain, contractAddress]);

  // Generate the CAIP-19 asset ID string
  const destinationAsset = useMemo(() => {
    if (!isAddressValid || !contractAddress) {
      return '';
    }
    
    // Format as chainNamespace:chainReference/tokenStandard:contractAddress
    const { caipNamespace, caipReference, tokenStandard } = selectedChain;
    
    if (tokenStandard) {
      return `${caipNamespace}:${caipReference}/${tokenStandard}:${contractAddress}`;
    }
    
    // For chains without a token standard, use the address directly
    // This might need adjustment based on specific chain requirements
    return `${caipNamespace}:${caipReference}/${contractAddress}`;
  }, [selectedChain, contractAddress, isAddressValid]);

  // Function to update the iframe src
  const updateEmbed = (): void => {
    if (!isAddressValid || !destinationAsset) {
      return;
    }
    
    const baseUrl = "https://obi.money/embed/tunnel";
    const url = new URL(baseUrl);
    url.searchParams.set('from', 'eip155:42161/slip44:60');
    url.searchParams.set('to', destinationAsset);
    
    // Using safer DOM manipulation without type assertions
    const iframe = document.getElementById(iframeId);
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.src = url.toString();
    }
    
    if (onAssetChange) {
      onAssetChange(destinationAsset);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-[#1A1A1A] p-8 w-full max-w-[400px] mx-auto h-full justify-center">
      <h3 className="text-xl font-bold text-white">Customize the Widget</h3>
      
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="chain-select" className="text-gray-300">Target Chain</label>
          <div className="relative">
            <select
              id="chain-select"
              value={selectedChain.id}
              onChange={(e) => {
                const chainId = e.target.value;
                const chain = CHAINS.find((c) => {
                  return c.id === chainId;
                });
                
                // Only set if chain is found (should always be true in this case)
                if (chain) {
                  setSelectedChain(chain);
                  setContractAddress('');
                }
              }}
              className="w-full bg-[#2A2A2A] text-white border border-[#3A3A3A] rounded-lg px-4 py-3 appearance-none"
            >
              {CHAINS.map((chain) => {
                return (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <label htmlFor="contract-address" className="text-gray-300">Target Token Contract Address</label>
          <input
            id="contract-address"
            type="text"
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value.trim());
            }}
            placeholder={selectedChain.addressPlaceholder}
            className="w-full bg-[#2A2A2A] text-white border border-[#3A3A3A] rounded-lg px-4 py-3"
          />
          {validationMessage && (
            <div className={`text-sm ${isAddressValid ? 'text-green-500' : 'text-red-500'}`}>
              {validationMessage}
            </div>
          )}
        </div>
        
        {isAddressValid && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="text-sm text-gray-300">CAIP-19 Identifier:</div>
            <div className="bg-[#2A2A2A] p-2 rounded text-xs text-gray-100 break-all overflow-x-auto">
              {destinationAsset}
            </div>
          </div>
        )}
      </div>
      
      <button
        className={`mt-4 rounded-lg px-6 py-3 font-normal ${
          isAddressValid 
            ? 'bg-primary text-[#070707] hover:bg-opacity-90' 
            : 'bg-[#4A4A4A] text-[#A0A0A0] cursor-not-allowed'
        }`}
        disabled={!isAddressValid}
        onClick={updateEmbed}
      >
        LOAD ASSET
      </button>
    </div>
  );
}

export default ChainAssetSelector; 