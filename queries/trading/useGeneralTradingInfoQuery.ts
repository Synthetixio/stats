import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import snxData from 'synthetix-data';

export interface GeneralTradingInfo {
	totalDailyTradingVolume: number;
	totalUsers: number;
}

export const useGeneralTradingInfoQuery = () => {
	return useQuery<GeneralTradingInfo, string>(QUERY_KEYS.Trading.GeneralTradingInfo, async () => {
		const ts = Math.floor(Date.now() / 1e3);
		const oneDayAgo = ts - 3600 * 24;

		const [exchanges, allTimeData] = await Promise.all([
			snxData.exchanges.since({ minTimestamp: oneDayAgo }),
			snxData.exchanges.total(),
		]);

		// @ts-ignore
		const totalDailyTradingVolume = exchanges.reduce(
			(acc: number, { fromAmountInUSD }: any) => acc + fromAmountInUSD,
			0
		);

		return {
			totalDailyTradingVolume,
			totalUsers: allTimeData.exchangers,
		};
	});
};
