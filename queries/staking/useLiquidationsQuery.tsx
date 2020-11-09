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
		snxData.snx.getCurrentLiquidations()
	);
};
