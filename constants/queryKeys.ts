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
	TokenBalance: (token: string, address: string) => ['balanceOf', token, address],

	CurveExchangeAmount: 'curveExchangeAmount',

	SnxHolders: 'snxHolders',
	sUSDHolders: 'sUSDHolders',
	SnxTotals: 'snxTotals',

	SynthetixTokenList: 'synthetixTokenList',

	Staking: {
		Liquidations: ['staking', 'liquidations'],
		FeePeriod: (period: number) => ['staking', 'feePeriod', period],
		AggregateActiveStakers: (args: any) => ['staking', 'aggregateActiveStakers', args],
	},
	Network: {
		SnxPriceChart: (chartPeriod: string) => ['network', 'snxPriceChart', chartPeriod],
	},
	Options: {
		Markets: (args: any) => ['markets', 'optionsMarkets', args],
		Transactions: (args: any) => ['markets', 'optionsTransactions', args],
	},
	Trading: {
		TradesOverPeriod: (args: any) => ['trading', 'tradesOverPeriod', args],
		GeneralTradingInfo: (minTimestamp: number) => ['trading', 'generalTradingInfo', minTimestamp],
	},
	YieldFarming: {
		CurveApy: ['yieldFarming', 'curveApy'],
		CurveInfo: ['yieldFarming', 'curveInfo'],
		RewardsInfo: (contractAddress: string) => ['yieldFarming', 'rewardsInfo', contractAddress],
	},
};
