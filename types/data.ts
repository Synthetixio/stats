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
