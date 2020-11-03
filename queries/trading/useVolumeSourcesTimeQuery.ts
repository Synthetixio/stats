import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { exchangeSourceData } from 'utils/customGraphQueries';
import { ChartPeriod } from 'types/data';

export type DailyVolumeSource = {
	dayID: number;
	partner: string;
	trades: number;
	usdFees: number;
	usdVolume: number;
};

const chartPeriodToTimeSeries: { [key: string]: string } = {
	W: '7d',
	M: '1mo',
	Y: '1y',
};

export const useVolumeSourcesTimeQuery = (period: ChartPeriod) => {
	return useQuery<DailyVolumeSource[], string>(
		QUERY_KEYS.Trading.VolumeSources(period).join(','),
		async () => exchangeSourceData({ timeSeries: chartPeriodToTimeSeries[period] })
	);
};
