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
		GeneralTradingInfo: (period: string) => ['trading', 'generalTradingInfo', period],
	},
	YieldFarming: {
		CurveApy: ['yieldFarming', 'curveApy'],
		CurveInfo: ['yieldFarming', 'curveInfo'],
		RewardsInfo: (contractAddress: string) => ['yieldFarming', 'rewardsInfo', contractAddress],
	},
};
