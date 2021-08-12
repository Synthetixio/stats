export default {
	CMC: (symbol: string) => ['cmc', symbol],
	PageResults: (query: any) => ['pageResults', query],
	SnxjsContract: (contract: string, method: string, args: any[]) => [
		'snxjs',
		'contract',
		contract,
		method,
		args,
	],

	CurveExchangeAmount: 'curveExchangeAmount',

	sUSDHolders: 'sUSDHolders',
	SnxTotals: 'snxTotals',

	Staking: {
		Liquidations: ['staking', 'liquidations'],
	},
	Trading: {
		GeneralTradingInfo: (minTimestamp: number) => ['trading', 'generalTradingInfo', minTimestamp],
	},
	YieldFarming: {
		CurveApy: ['yieldFarming', 'curveApy'],
		CurveInfo: ['yieldFarming', 'curveInfo'],
		RewardsInfo: (contractAddress: string) => ['yieldFarming', 'rewardsInfo', contractAddress],
	},
};
