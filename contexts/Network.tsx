import { FC, useState, useContext, createContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { NetworkId, SynthetixJS } from '@synthetixio/contracts-interface';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import { SynthetixProvider } from '@synthetixio/providers';
import { SynthetixData } from '@synthetixio/data';

const providerL1 = new ethers.providers.InfuraProvider(
	'homestead',
	process.env.NEXT_PUBLIC_INFURA_KEY
) as SynthetixProvider;
const providerL2 = new ethers.providers.JsonRpcProvider(
	'https://mainnet.optimism.io'
) as SynthetixProvider;

const NetworkContext = createContext<{
	snxJs: SynthetixJS;
	snxData: SynthetixData;
	provider: SynthetixProvider;
	toggleNetwork: () => void;
	networkId: NetworkId;
	isL2: boolean;
} | null>(null);

export const NetworkProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [networkId, setNetworkId] = useState<NetworkId>(NetworkId['Mainnet']);

	const isL2 = networkId === NetworkId['Mainnet-Ovm'];
	const provider = isL2 ? providerL2 : providerL1;
	const ctx = createQueryContext({
		provider,
		networkId,
	});

	const snxJs = ctx.snxjs!;
	const snxData = ctx.snxData!;

	const toggleNetwork = () => {
		setNetworkId((networkId) =>
			networkId === NetworkId['Mainnet-Ovm'] ? NetworkId.Mainnet : NetworkId['Mainnet-Ovm']
		);
	};

	return (
		<SynthetixQueryContextProvider value={ctx}>
			<NetworkContext.Provider
				value={{
					snxJs,
					snxData,
					provider,
					toggleNetwork,
					networkId,
					isL2,
				}}
			>
				{children}
			</NetworkContext.Provider>
		</SynthetixQueryContextProvider>
	);
};

export function useNetwork() {
	const context = useContext(NetworkContext);
	if (!context) {
		throw new Error('Missing Network context');
	}
	const { snxJs, snxData, provider, toggleNetwork, networkId, isL2 } = context;

	return {
		snxJs,
		snxData,
		provider,
		toggleNetwork,
		networkId,
		isL2,
	};
}
