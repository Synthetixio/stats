import { BigNumber } from 'ethers';
import { AnyQueryKey } from 'react-query';

// TODO normalize these keys and improve types so don't have to call as AnyQueryKey on all
const QUERY_KEYS = {
	Contracts: {
		EtherCollateralsUSD: {
			TotalIssuedSynths: ['contracts', 'etherCollateralUSD', 'totalIssuedSynths'] as AnyQueryKey,
		},
		ExchangeRates: {
			RateForCurrency: (name: string): AnyQueryKey => ['contracts', 'exchangeRates', name],
		},
		Synthetix: {
			TotalSupply: ['contracts', 'synthetix', 'totalSupply'] as AnyQueryKey,
			LastDebtLedgerEntry: ['contracts', 'synthetix', 'lastDebtLedgerEntry'] as AnyQueryKey,
			TotalIssuedSynthsExcludeEtherCollateral: (name: string): AnyQueryKey => [
				'contracts',
				'synthetix',
				'totalIssuedSynthsExcludeEtherCollateral',
				name,
			],
			Network: {
				Meta: ['contracts', 'synthetix', 'network', 'meta'] as AnyQueryKey,
			},
		},
		SynthetixState: {
			IssuanceRatio: ['contracts', 'synthetixState', 'issuanceRatio'] as AnyQueryKey,
		},
		SynthsUSD: {
			TotalSupply: ['contracts', 'synthsUSD', 'totalSupply'] as AnyQueryKey,
		},
		Curve: {
			GetDYUnderlying: (
				susdContractNumber: number,
				usdcContractNumber: number,
				susdAmountWei: BigNumber
			): AnyQueryKey => [
				'contracts',
				'curve',
				susdContractNumber,
				usdcContractNumber,
				susdAmountWei,
			],
		},
	},
	SNXData: {
		SNX: {
			Holders: ['snxData', 'snx', 'holders'] as AnyQueryKey,
			Total: ['snxData', 'snx', 'total'] as AnyQueryKey,
		},
		Synths: {
			Holders: (synth: string) => ['snxData', 'synths', 'total', synth] as AnyQueryKey,
		},
		Rate: {
			SNXAggregate: (timeseries: string, max: number): AnyQueryKey => [
				'snxData',
				'rate',
				'snxAggregate',
				timeseries,
				max,
			],
		},
	},
	CMC: {
		Price: (name: string): AnyQueryKey => ['cmc', 'price', name],
	},
	Wallet: {
		Balance: (address: string): AnyQueryKey => ['wallet', 'balance', address],
	},
};

export default QUERY_KEYS;
