import { SynthetixJS } from '@synthetixio/contracts-interface';

export default {
	CMC: (symbol: string) => ['cmc', symbol],
	PageResults: (query: any) => ['pageResults', query],
	SnxjsContract: (snxJs: SynthetixJS, contract: string, method: string, args: any[]) => [
		'snxJs',
		'contract',
		snxJs.network,
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
