import { useQuery } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

export type LiquidationsData = {
	deadline: number;
	account: string;
	collateralRatio: number;
	collateral: number;
	liquidatableNonEscrowSNX: number;
};

export const useLiquidationsQuery = () => {
	return useQuery<LiquidationsData[], string>(QUERY_KEYS.Staking.Liquidations, async () =>
		// snxData.snx.getCurrentLiquidations()
		[
			{
				account: '0x2debdf4427ccbcfdbc7f29d63964499a0ec184f6',
				collateral: 234465116044829631309304 / 1e18,
				collateralRatio: 501357975943412853 / 1e18,
				deadline: 1605268924 * 1000,
				liquidatableNonEscrowSNX: 168803538120819522772411 / 1e18,
			},
			{
				account: '0x5e4774b93d012e0fe86655ddda16916b1988b274',
				collateral: 24180753555868740393042 / 1e18,
				collateralRatio: 502982690710701367 / 1e18,
				deadline: 1605068811 * 1000,
				liquidatableNonEscrowSNX: 8101239424864167139541 / 1e18,
			},
			{
				account: '0xcee873c0acb9f619b57733e9da0409ebd31abeea',
				collateral: 347981170000000000000 / 1e18,
				collateralRatio: 509312678694724380 / 1e18,
				deadline: 1604668732 * 1000,
				liquidatableNonEscrowSNX: 347981170000000000000 / 1e18,
			},
		]
	);
};
