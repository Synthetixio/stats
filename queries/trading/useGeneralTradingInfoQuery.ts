import useSynthetixQueries from '@synthetixio/queries';
import { Period } from '@synthetixio/queries/build/node/src/constants';
import { SynthExchangeExpanded } from '@synthetixio/data';

export interface GeneralTradingInfo {
	exchanges: SynthExchangeExpanded[];
	totalDailyTradingVolume: number;
	totalUsers: number;
}

export const useGeneralTradingInfoQuery = () => {
	const { useSynthExchangesSinceQuery, useExchangeTotalsQuery } = useSynthetixQueries();
	const exchangesQuery = useSynthExchangesSinceQuery(Period.ONE_DAY);
	const totalsQuery = useExchangeTotalsQuery({ timeSeries: 'all', max: 1 });

	const exchanges = exchangesQuery.isSuccess
		? (exchangesQuery.data as SynthExchangeExpanded[])
		: [];
	const totals = totalsQuery.isSuccess ? totalsQuery.data : [];
	const total = totals?.[0];

	const totalDailyTradingVolume: number = exchanges.reduce(
		(acc: number, { fromAmountInUSD }: any) => acc + Number(fromAmountInUSD),
		0
	);

	return {
		exchanges,
		totalDailyTradingVolume,
		totalUsers: total?.exchangers ?? 0,
	};
};
