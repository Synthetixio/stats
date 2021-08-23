import { useQuery } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import snxData from 'synthetix-data';
import useSynthetixQueries from '@synthetixio/queries';
import { Period } from '@synthetixio/queries/build/node/src/constants';
import { SynthExchangeExpanded } from '@synthetixio/data/build/node/src/types';
import { periodToDays } from 'utils/dataMapping';

export interface GeneralTradingInfo {
	exchanges: any[]; // SynthExchangeExpanded[];
	totalDailyTradingVolume: number;
	totalUsers: number;
}

export const useGeneralTradingInfoQuery = (period: string) => {
	// const { useSynthExchangesSinceQuery, useExchangeTotalsQuery } = useSynthetixQueries();

	// const exchangesQuery = useSynthExchangesSinceQuery(period as Period);
	// const totalsQuery = useExchangeTotalsQuery({});

	// const exchanges: SynthExchangeExpanded[] = exchangesQuery.isSuccess ? exchangesQuery.data : [];
	// const totals = totalsQuery.isSuccess ? totalsQuery.data : [];
	// const total = totals?.[0];

	return useQuery<GeneralTradingInfo, string>(
		QUERY_KEYS.Trading.GeneralTradingInfo(period),
		async () => {
			const [exchanges, total] = await Promise.all([
				snxData.exchanges.since({ minTimestamp: Math.floor(Date.now() / 1000 - 86400) }),
				snxData.exchanges.total(),
			]);

			// @ts-ignore
			const totalDailyTradingVolume: number = exchanges.reduce(
				(acc: number, { fromAmountInUSD }: any) => acc + fromAmountInUSD,
				0
			);

			return {
				exchanges,
				totalDailyTradingVolume,
				totalUsers: total?.exchangers ?? 0,
			};
		}
	);
};
