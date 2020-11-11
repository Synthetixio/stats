import { useContext } from 'react';
import { useQuery } from 'react-query';
import { BigNumber } from 'ethers';
import { SNXJSContext } from 'pages/_app';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

export type LiquidationsData = {
	deadline: number;
	account: string;
	currentRatio: number;
	currentCollateral: number;
	currentBalanceOf: number;
};

export const useLiquidationsQuery = () => {
	const snxjs = useContext(SNXJSContext);
	return useQuery<LiquidationsData[], string>(QUERY_KEYS.Staking.Liquidations, async () => {
		const activeLiquidations = await snxData.liquidations.getActiveLiquidations();
		const liquidations = [];
		for (let i = 0; i < activeLiquidations.length; i++) {
			let promises = await Promise.all([
				snxjs.contracts.Synthetix.collateralisationRatio(activeLiquidations[i].account),
				snxjs.contracts.Synthetix.collateral(activeLiquidations[i].account),
				snxjs.contracts.Synthetix.balanceOf(activeLiquidations[i].account),
			]);

			let [currentRatio, currentCollateral, currentBalanceOf] = promises.map((val: BigNumber) =>
				Number(snxjs.utils.formatEther(val))
			);
			liquidations.push({
				deadline: activeLiquidations[i].deadline,
				account: activeLiquidations[i].account,
				currentRatio,
				currentCollateral,
				currentBalanceOf,
			});
		}
		return liquidations;
	});
};
