import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { curvepoolRewards, snxRewards } from 'contracts';

export interface RewardsContractInfo {
	duration: number;
	rate: number;
	periodFinish: number;
}

export const useRewardsContractInfo = (
	provider: ethers.providers.Provider,
	contractAddress: string,
	isCurve: boolean
) => {
	const rewardsContract = new ethers.Contract(
		contractAddress,
		isCurve ? curvepoolRewards.abi : snxRewards.abi,
		provider
	);

	return useQuery<RewardsContractInfo, string>(
		QUERY_KEYS.YieldFarming.RewardsInfo(contractAddress),
		async () => {
			const rawRewardsContractInfo = await Promise.all([
				rewardsContract.DURATION ? rewardsContract.DURATION() : rewardsContract.rewardsDuration(),
				rewardsContract.rewardRate(),
				rewardsContract.periodFinish(),
			]);

			let [duration, rate, periodFinish] = rawRewardsContractInfo.map((d) =>
				Number(ethers.utils.formatEther(d))
			);
			periodFinish = rawRewardsContractInfo[2].toNumber();

			return {
				duration,
				rate,
				periodFinish,
			};
		}
	);
};
