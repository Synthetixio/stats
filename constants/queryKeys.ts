import { BigNumber } from 'ethers';
import { QueryKeyOrPredicateFn, QueryKeyPart } from 'react-query';
import { ChartPeriod } from 'types/data';

const QUERY_KEYS = {
	Contracts: {
		EtherCollateralsUSD: {
			TotalIssuedSynths: ['contracts', 'etherCollateralUSD', 'totalIssuedSynths'],
		},
		ExchangeRates: {
			RateForCurrency: (name: string): QueryKeyOrPredicateFn => [
				'contracts',
				'exchangeRates',
				name,
			],
		},
		Synthetix: {
			TotalSupply: ['contracts', 'synthetix', 'totalSupply'] as QueryKeyOrPredicateFn,
			LastDebtLedgerEntry: ['contracts', 'synthetix', 'lastDebtLedgerEntry'],
			TotalIssuedSynthsExcludeEtherCollateral: (name: string) => [
				'contracts',
				'synthetix',
				'totalIssuedSynthsExcludeEtherCollateral',
				name,
			],
			Network: {
				Meta: ['contracts', 'synthetix', 'network', 'meta'],
			},
		},
		SynthetixState: {
			IssuanceRatio: ['contracts', 'synthetixState', 'issuanceRatio'],
		},
		SynthsUSD: {
			TotalSupply: ['contracts', 'synthsUSD', 'totalSupply'],
		},
		Curve: {
			GetDYUnderlying: (
				susdContractNumber: number,
				usdcContractNumber: number,
				susdAmountWei: BigNumber
			): QueryKeyOrPredicateFn => [
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
			Holders: ['snxData', 'snx', 'holders'],
			Total: ['snxData', 'snx', 'total'],
		},
		Synths: {
			Holders: (synth: string) => ['snxData', 'synths', 'total', synth],
		},
		Rate: {
			SNXAggregate: (timeseries: string, max: number) => [
				'snxData',
				'rate',
				'snxAggregate',
				timeseries,
				max,
			],
		},
	},
	CMC: {
		Price: (name: string): QueryKeyOrPredicateFn => ['cmc', 'price', name],
	},
	Wallet: {
		Balance: (address: string) => ['wallet', 'balance', address],
	},
};

export default QUERY_KEYS;
