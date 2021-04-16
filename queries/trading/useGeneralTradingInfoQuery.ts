import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import snxData from 'synthetix-data';

export interface GeneralTradingInfo {
	exchanges: any[];
	totalDailyTradingVolume: number;
	totalUsers: number;
}

export const useGeneralTradingInfoQuery = (minTimestamp: number) => {
	return useQuery<GeneralTradingInfo, string>(
		QUERY_KEYS.Trading.GeneralTradingInfo(minTimestamp),
		async () => {
			const [exchanges, allTimeData] = await Promise.all([
				snxData.exchanges.since({ minTimestamp }),
				snxData.exchanges.total(),
			]);

			// @ts-ignore
			const totalDailyTradingVolume = exchanges.reduce(
				(acc: number, { fromAmountInUSD }: any) => acc + fromAmountInUSD,
				0
			);

			return {
				exchanges,
				totalDailyTradingVolume,
				totalUsers: allTimeData.exchangers,
			};
		}
	);
};
