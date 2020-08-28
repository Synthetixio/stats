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

export type ChartData = {
	created: string;
	value: number;
};

export type ChartPeriod = 'D' | 'W' | 'M' | 'Y';

export type TimeSeries = '1d' | '15m';
