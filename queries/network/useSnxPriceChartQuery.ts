import { useQuery } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { AreaChartData, SNXPriceData, TimeSeries } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';

export type LiquidationsData = {
	deadline: number;
	account: string;
	currentRatio: number;
	currentCollateral: number;
	currentBalanceOf: number;
};

const formatChartData = (data: SNXPriceData[], timeSeries: TimeSeries): AreaChartData[] =>
	(data as SNXPriceData[]).map(({ id, averagePrice }) => {
		return {
			created: formatIdToIsoString(id, timeSeries as TimeSeries),
			value: averagePrice,
		};
	});

export const useSnxPriceChartQuery = (fetchPeriod: string) => {
	return useQuery<AreaChartData[], string>(
		QUERY_KEYS.Network.SnxPriceChart(fetchPeriod),
		async () => {
			let newSNXPriceData = [];
			let timeSeries = '1d';
			if (fetchPeriod === 'D') {
				timeSeries = '15m';
				newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
			} else if (fetchPeriod === 'W') {
				timeSeries = '15m';
				newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 * 7 });
			} else if (fetchPeriod === 'M') {
				newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 30 });
			} else if (fetchPeriod === 'Y') {
				newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 365 });
			}
			newSNXPriceData.reverse();
			return formatChartData(newSNXPriceData, timeSeries as TimeSeries);
		}
	);
};
