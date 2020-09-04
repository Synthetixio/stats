export type OpenInterest = {
	[name: string]: {
		[subName: string]: {
			value: number;
			totalSupply: number;
		};
	};
};

export type SynthTotalSupply = {
	name: string;
	totalSupply?: number;
	value: number;
};

export type SNXPriceData = {
	id: string;
	averagePrice: number;
};

export type TradesRequestData = {
	id: string;
	trades: number;
	exchangers: number;
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
};
