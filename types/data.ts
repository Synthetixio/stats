export type SNXPriceData = {
	id: string;
	averagePrice: number;
};

export type AreaChartData = {
	created: string;
	value: number;
};

export type TreeMapData = {
	value: number;
	name: string;
};

export type ChartPeriod = 'D' | 'W' | 'M' | 'Y';

export type TimeSeries = '1d' | '15m';

export type FeePeriod = {
	feesToDistribute: number;
	feesClaimed: number;
	rewardsToDistribute: number;
	rewardsClaimed: number;
	startTime: number;
};
