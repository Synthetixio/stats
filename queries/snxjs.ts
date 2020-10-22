import { useQuery, BaseQueryOptions, AnyQueryKey } from 'react-query';
import { useContext } from 'react';
import QUERY_KEYS from 'constants/queryKeys';

import { SNXJSContext } from 'pages/_app';
import { useSNXNetworkMeta } from './snxData';
import { useQueryGroup } from './useQueryGroup';
import { Currency } from 'constants/currency';

export const useRateForCurrency = (name: string, options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.ExchangeRates.RateForCurrency(name),
		async () => {
			const unformattedData = await snxjs.contracts.ExchangeRates.rateForCurrency(
				snxjs.toBytes32(name)
			);
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useTotalSupply = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.Synthetix.TotalSupply,
		async () => {
			const unformattedData = await snxjs.contracts.Synthetix.totalSupply();
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useLastDebtLedgerEntry = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.Synthetix.LastDebtLedgerEntry,
		async () => {
			const unformattedData = await snxjs.contracts.SynthetixState.lastDebtLedgerEntry();
			return Number(snxjs.utils.formatUnits(unformattedData, 27));
		},
		{ ...options }
	);
};

export const useTotalIssuedSynthsExcludeEtherCollateral = (
	name: string,
	options?: BaseQueryOptions
) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.Synthetix.TotalIssuedSynthsExcludeEtherCollateral(name),
		async () => {
			const unformattedData = await snxjs.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(
				snxjs.toBytes32(name)
			);
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useIssuanceRatio = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.SynthetixState.IssuanceRatio,
		async () => {
			const unformattedData = snxjs.contracts.SynthetixState.issuanceRatio();
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useSynthSUSDTotalSupply = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.SynthsUSD.TotalSupply,
		async () => {
			const unformattedData = await snxjs.contracts.SynthsUSD.totalSupply();
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useTotalIssuedSynths = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<number, AnyQueryKey>(
		QUERY_KEYS.Contracts.EtherCollateralsUSD.TotalIssuedSynths,
		async () => {
			const unformattedData = await snxjs.contracts.EtherCollateralsUSD.totalIssuedSynths();
			return Number(snxjs.utils.formatEther(unformattedData));
		},
		{ ...options }
	);
};

export const useMarketCap = (synth: string) => {
	const snxjs = useContext(SNXJSContext);
	const { formatEther } = snxjs.utils;

	return useQueryGroup([useRateForCurrency(synth), useTotalSupply()], (price, totalSupply) => {
		const marketCap = totalSupply * price;
		return marketCap;
	});
};

export const useTotalSNXLocked = () => {
	const snxjs = useContext(SNXJSContext);
	const { formatEther } = snxjs.utils;
	const networkMetaQuery = useSNXNetworkMeta();
	return useQueryGroup(
		[useRateForCurrency(Currency.SNX), useTotalSupply()],
		(price, totalSupply) => {
			const { snxLocked, snxTotal } = networkMetaQuery.data;
			const percentLocked = snxLocked / snxTotal;

			const totalSNXLocked = percentLocked * totalSupply * price;
			return totalSNXLocked;
		},
		{ enabled: networkMetaQuery.data }
	);
};

export const useNetworkCRatio = () => {
	const snxjs = useContext(SNXJSContext);
	const { formatEther } = snxjs.utils;

	return useQueryGroup(
		[
			useTotalSupply(),
			useRateForCurrency(Currency.SNX),
			useTotalIssuedSynthsExcludeEtherCollateral(Currency.sUSD),
		],
		(totalSupply, price, totalIssuedSynthsExcludingEther) => {
			const networkCRatio = (totalSupply * price) / totalIssuedSynthsExcludingEther;
			return networkCRatio;
		}
	);
};
