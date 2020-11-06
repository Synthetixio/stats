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
	// return useQuery<LiquidationsData[], string>(QUERY_KEYS.Staking.Liquidations, async () =>
	// 	snxData.snx.getCurrentLiquidations()
	// );
	return {
		isLoading: false,
		data: [
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
			{
				account: '0x5493722a1c8A7C3b868548874756723DB15672cA',
				deadline: 1604711769085,
				collateralRatio: 600,
				collateral: 150,
				liquidatableNonEscrowSNX: 150,
			},
		],
	};
};
