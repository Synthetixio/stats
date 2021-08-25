import { useContext } from 'react';
import { ethers } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { NetworkId, Synths } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { SynthTotalSupply, SynthsTotalSupplyData } from '@synthetixio/queries';

import { SNXJSContextL2 } from 'pages/_app';

const useL2SynthsTotalSupplyQuery = (options?: UseQueryOptions<SynthsTotalSupplyData>) => {
	const networkId = NetworkId['Mainnet-Ovm'];
	const snxjs = useContext(SNXJSContextL2);

	return useQuery<SynthsTotalSupplyData>(
		['synths', 'totalSupply', networkId],
		async () => {
			const {
				contracts: { SynthUtil, ExchangeRates },
			} = snxjs!;

			const {
				utils: { formatBytes32String, parseBytes32String, formatEther },
			} = ethers;

			const [sETHKey, sBTCKey, sUSDKey] = [Synths.sETH, Synths.sBTC, Synths.sUSD].map(
				formatBytes32String
			);

			const [synthTotalSupplies, unformattedEthPrice, unformattedBtcPrice] = await Promise.all([
				SynthUtil.synthsTotalSupplies(),
				ExchangeRates.rateForCurrency(sETHKey),
				ExchangeRates.rateForCurrency(sBTCKey),
			]);

			const [ethPrice, btcPrice] = [unformattedEthPrice, unformattedBtcPrice].map((val) =>
				wei(formatEther(val))
			);

			let totalValue = wei(0);
			let ethNegativeEntries = wei(0);
			let btcNegativeEntries = wei(0);
			let usdNegativeEntries = wei(0);

			const supplyData: SynthTotalSupply[] = [];
			for (let i = 0; i < synthTotalSupplies[0].length; i++) {
				let value = wei(formatEther(synthTotalSupplies[2][i]));
				const name = parseBytes32String(synthTotalSupplies[0][i]);
				const totalSupply = wei(formatEther(synthTotalSupplies[1][i]));

				const skewValue = value;
				value = value.abs();

				supplyData.push({
					name,
					totalSupply,
					value,
					skewValue,
					poolProportion: wei(0), // true value to be computed in next step
				});
				totalValue = totalValue.add(value);
			}

			// Add proportion data to each SynthTotalSupply object
			const supplyDataWithProportions = supplyData.map((datum) => ({
				...datum,
				poolProportion: totalValue.gt(0) ? datum.value.div(totalValue) : wei(0),
			}));

			const supplyDataMap: { [name: string]: SynthTotalSupply } = {};
			for (const synthSupply of supplyDataWithProportions) {
				supplyDataMap[synthSupply.name] = synthSupply;
			}

			return {
				totalValue,
				supplyData: supplyDataMap,
				priceData: {
					ethPrice,
					btcPrice,
				},
				shortData: {
					ethNegativeEntries,
					btcNegativeEntries,
					usdNegativeEntries,
				},
				synthTotalSupplies,
			};
		},
		{
			enabled: !!snxjs,
			...options,
		}
	);
};

export default useL2SynthsTotalSupplyQuery;
