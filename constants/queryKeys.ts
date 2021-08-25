import { SynthetixJS } from '@synthetixio/contracts-interface';

export default {
	CMC: (symbol: string) => ['cmc', symbol],
	PageResults: (query: any) => ['pageResults', query],
	SnxjsContract: (snxjs: SynthetixJS, contract: string, method: string, args: any[]) => [
		'snxjs',
		'contract',
		snxjs.network,
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
