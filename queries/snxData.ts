import { useQuery, BaseQueryOptions, AnyQueryKey } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import snxData from 'synthetix-data';
import {
	useIssuanceRatio,
	useLastDebtLedgerEntry,
	useSynthSUSDTotalSupply,
	useTotalIssuedSynthsExcludeEtherCollateral,
} from './snxjs';
import useQueryGroup from './useQueryGroup';
import { AreaChartData, ChartPeriod, SNXPriceData, TimeSeries } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';
import { Currency } from 'constants/currency';

export type SNXHolder = {
	id: number;
	block: number;
	timestamp: Date;
	balanceOf: number;
	collateral: number;
	transferable: number;
	initialDebtOwnership: number;
	debtEntryAtIndex: number;
	claims: number;
	mints: number;
};

export const useSNXNetworkMeta = () =>
	useQueryGroup(
		[
			useSNXHolders(),
			useTotalIssuedSynthsExcludeEtherCollateral(Currency.sUSD),
			useLastDebtLedgerEntry(),
			useIssuanceRatio(),
			useSynthSUSDTotalSupply(),
		],
		(holders, totalIssuedSynths, lastDebtLedgerEntry, issuanceRatio, usdToSnxPrice) => {
			console.log('holders', holders);
			console.log('totalIssuedSynths', totalIssuedSynths);
			let snxTotal = 0;
			let snxLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;

			for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
				let collateralRatio = debtBalance / collateral / usdToSnxPrice;

				if (isNaN(debtBalance)) {
					debtBalance = 0;
					collateralRatio = 0;
				}
				const lockedSnx = collateral * Math.min(1, collateralRatio / issuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToSnxPrice);
				}
				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);
			}

			return { snxTotal, snxLocked, stakersTotalDebt, stakersTotalCollateral };
		}
	);

export const useSNXHolders = (max: number = 1000, options?: BaseQueryOptions) =>
	useQuery<Array<SNXHolder>, AnyQueryKey>(
		QUERY_KEYS.SNXData.SNX.Holders,
		() => snxData.snx.holders({ max }),
		{
			...options,
		}
	);

type SNXTotal = {
	issuers: number;
	snxHolders: number;
};

export const useSNXTotal = (options?: BaseQueryOptions) =>
	useQuery<SNXTotal, AnyQueryKey>(QUERY_KEYS.SNXData.SNX.Total, () => snxData.snx.total(), {
		...options,
	});

type SynthHolderBalance = {
	address: string;
	balanceOf: number;
	synth: string;
};

export const useSynthHolders = (synth: string, max: number = 5, options?: BaseQueryOptions) =>
	useQuery<Array<SynthHolderBalance>, AnyQueryKey>(
		QUERY_KEYS.SNXData.Synths.Holders(synth),
		() => snxData.synths.holders({ synth, max }),
		{ ...options }
	);

const CHART_PERIOD_META = {
	D: { timeSeries: '15m', max: 24 * 4 },
	W: { timeSeries: '15m', max: 24 * 4 * 7 },
	M: { timeSeries: '1d', max: 30 },
	Y: { timeSeries: '1d', max: 365 },
};

export const useSNXPriceChart = (period: ChartPeriod) => {
	const { timeSeries, max } = CHART_PERIOD_META[period];
	return useQuery<AreaChartData[], AnyQueryKey>(
		QUERY_KEYS.SNXData.Rate.SNXAggregate(timeSeries, max),
		async () => {
			const data = await snxData.rate.snxAggregate({
				timeSeries,
				max,
			});
			return formatChartData(data.reverse(), timeSeries as TimeSeries);
		}
	);
};

const formatChartData = (data: SNXPriceData[], timeSeries: TimeSeries): AreaChartData[] =>
	data.map(({ id, averagePrice }) => {
		return {
			created: formatIdToIsoString(id, timeSeries as TimeSeries),
			value: averagePrice,
		};
	});
