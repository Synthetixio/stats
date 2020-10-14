import { useQuery, BaseQueryOptions, QueryKey } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber } from 'ethers';
import { SNXContext, SNXJSContext } from 'pages/_app';
import { useContext, useState } from 'react';
import { useChartData, useSNXNetworkMeta } from './snxData';
import { useQueryGroup } from './useQueryGroup';
import { ChartPeriod } from 'types/data';

export const useRateForCurrency = (name: string, options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.ExchangeRates.RateForCurrency(name),
		() => snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32(name)),
		{ ...options }
	);
};

export const useTotalSupply = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.Synthetix.TotalSupply,
		() => snxjs.contracts.Synthetix.totalSupply(),
		{ ...options }
	);
};

export const useLastDebtLedgerEntry = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.Synthetix.LastDebtLedgerEntry,
		() => snxjs.contracts.SynthetixState.lastDebtLedgerEntry(),
		{ ...options }
	);
};

export const useTotalIssuedSynthsExcludeEtherCollateral = (
	name: string,
	options?: BaseQueryOptions
) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.Synthetix.TotalIssuedSynthsExcludeEtherCollateral(name),
		() => snxjs.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(snxjs.toBytes32(name)),
		{ ...options }
	);
};

export const useIssuanceRatio = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.SynthetixState.IssuanceRatio,
		() => snxjs.contracts.SynthetixState.issuanceRatio(),
		{ ...options }
	);
};

export const useSynthSUSDTotalSupply = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.SynthsUSD.TotalSupply,
		() => snxjs.contracts.SynthsUSD.totalSupply(),
		{ ...options }
	);
};

export const useTotalIssuedSynths = (options?: BaseQueryOptions) => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<BigNumber, QueryKey<any>>(
		QUERY_KEYS.Contracts.EtherCollateralsUSD.TotalIssuedSynths,
		() => snxjs.contracts.EtherCollateralsUSD.totalIssuedSynths(),
		{ ...options }
	);
};

export const useMarketCap = (synth: string) => {
	const snxjs = useContext(SNXJSContext);
	const { formatEther } = snxjs.utils;

	return useQueryGroup(
		[useRateForCurrency(synth), useTotalSupply()],
		(unformattedPrice, unformattedSnxTotalSupply) => {
			const price = Number(formatEther(unformattedPrice));
			const totalSupply = Number(formatEther(unformattedSnxTotalSupply));
			const marketCap = totalSupply * price;
			return marketCap;
		}
	);
};

export const useTotalSNXLocked = () => {
	const snxjs = useContext(SNXJSContext);
	const { formatEther } = snxjs.utils;
	const networkMetaQuery = useSNXNetworkMeta();
	return useQueryGroup(
		[useRateForCurrency('SNX'), useTotalSupply()],
		(unformattedSnxPrice, unformattedSnxTotalSupply) => {
			const { snxLocked, snxTotal } = networkMetaQuery.data;
			const percentLocked = snxLocked / snxTotal;
			const totalSupplySNX = Number(formatEther(unformattedSnxTotalSupply));
			const priceSNX = Number(formatEther(unformattedSnxPrice));

			const totalSNXLocked = percentLocked * totalSupplySNX * priceSNX;
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
			useRateForCurrency('SNX'),
			useTotalIssuedSynthsExcludeEtherCollateral('sUSD'),
		],
		(unformattedSnxTotalSupply, unformattedSnxPrice, unformattedTotalIssuedSynths) => {
			const totalSupply = Number(formatEther(unformattedSnxTotalSupply));
			const formattedSNXPrice = Number(formatEther(unformattedSnxPrice));
			const totalIssuedSynths = Number(formatEther(unformattedTotalIssuedSynths));

			const networkCRatio = (totalSupply * formattedSNXPrice) / totalIssuedSynths;
			return networkCRatio;
		}
	);
};

export const useSNXPriceChart = (period: ChartPeriod) =>
	useQueryGroup(
		[useChartData(period), useRateForCurrency('SNX')],
		(chartData, snxPrice) => {
			const priorSNXPrice = chartData[0].averagePrice;
			const percentChange = snxPrice / priorSNXPrice - 1;
			return { chartData, snxPrice, priorSNXPrice, percentChange };
		},
		{
			initialData: {
				chartData: [],
				snxPrice: null,
				priorSNXPrice: null,
				percentChange: null,
			},
		}
	);
