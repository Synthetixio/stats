import { useQuery } from 'react-query';
import { BigNumber } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';
import { FeePeriod } from 'types/data';
import { SynthetixJS } from '@synthetixio/js';

export const useFeePeriodQuery = (snxjs: SynthetixJS, period: number) => {
	return useQuery<FeePeriod, string>(QUERY_KEYS.Staking.FeePeriod(period), async () => {
		const { formatEther } = snxjs.utils;
		const feePeriod = await snxjs.contracts.FeePool.recentFeePeriods(period);
		return {
			startTime: BigNumber.from(feePeriod.startTime).toNumber() * 1000 || 0,
			feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
			feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
			rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
			rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
		};
	});
};
