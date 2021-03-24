import { useQuery, UseQueryResult } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { curvepoolRewards, snxRewards } from 'contracts';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { SynthetixJS } from '@synthetixio/js';
import { useCMCQuery } from 'queries/shared/useCMCQuery';
import axios from 'axios';
import { useCurveContractInfoQuery } from './useCurveContractInfoQuery';

export interface RewardsContractInfo {
	duration: number;
	rate: number;
	totalSupply: number;
	periodFinish: number;
}

export interface RewardsData {
	price: number | null;
	apy: number | null;
	distribution: number | null;
	rewardsInfo: RewardsContractInfo | null;
	queries: UseQueryResult[];
}

export const useRewardsContractInfo = (
	snxjs: SynthetixJS,
	provider: ethers.providers.Provider,
	fromToken: string,
	contractAddress: string,
	type: 'shorting' | 'staking' | 'curve'
) => {
	const rewardsContract = new ethers.Contract(
		contractAddress,
		type === 'curve' ? curvepoolRewards.abi : snxRewards.abi,
		provider
	);

	const rewardsInfo = useQuery<RewardsContractInfo, string>(
		QUERY_KEYS.YieldFarming.RewardsInfo(contractAddress),
		async () => {
			const rawRewardsContractInfo = await Promise.all([
				rewardsContract.DURATION ? rewardsContract.DURATION() : rewardsContract.rewardsDuration(),
				rewardsContract.rewardRate(),
				rewardsContract.totalSupply(),
				rewardsContract.periodFinish(),
			]);

			return {
				duration: rawRewardsContractInfo[0].toNumber(),
				rate: Number(ethers.utils.formatEther(rawRewardsContractInfo[1])),
				totalSupply: Number(ethers.utils.formatEther(rawRewardsContractInfo[2])),
				periodFinish: rawRewardsContractInfo[3].toNumber(),
			};
		}
	);

	const price = useSnxjsContractQuery<ethers.BigNumber>(snxjs, 'ExchangeRates', 'rateForCurrency', [
		snxjs.toBytes32(fromToken),
	]);

	const SNXPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('SNX')]
	);

	let distribution = null;
	if (rewardsInfo.isSuccess) {
		const d = rewardsInfo.data;
		const durationInWeeks = d.duration / (3600 * 24 * 7);
		const isPeriodFinished = new Date().getTime() > Number(d.periodFinish) * 1000;

		distribution = isPeriodFinished ? 0 : (d.duration * d.rate) / durationInWeeks;
	}

	let apy = 0;

	if (rewardsInfo.isSuccess && price.isSuccess && SNXPrice.isSuccess) {
		apy =
			(rewardsInfo.data.rate *
				(365 * 24 * 60 * 60) *
				Number(ethers.utils.formatEther(SNXPrice.data))) /
			rewardsInfo.data.totalSupply /
			Number(ethers.utils.formatEther(price.data!));
	}

	const queries: UseQueryResult[] = [price, SNXPrice, rewardsInfo];

	if (type === 'curve') {
		/* eslint-disable react-hooks/rules-of-hooks */
		const curveContractInfo = useCurveContractInfoQuery(provider);
		const crvPriceInfo = useCMCQuery('CRV');
		const curveApy = useQuery<any, string>(QUERY_KEYS.YieldFarming.CurveApy, async () => {
			return (await axios.get('https://stats.curve.fi/raw-stats/apyss.json')).data; // temp broken for testing
		});

		if (curveContractInfo.isSuccess) {
			const d = curveContractInfo.data!;

			const curveSUSDTokenRate =
				(((d.curveInflationRate * d.gaugeRelativeWeight * 31536000) / d.curveWorkingSupply) * 0.4) /
				d.curveSusdTokenPrice;

			apy += crvPriceInfo.isSuccess ? crvPriceInfo.data!.quote.USD.price * curveSUSDTokenRate : 0;
		}

		apy += curveApy?.data?.apy?.day?.susd || 0;

		queries.push(curveContractInfo, crvPriceInfo, curveApy);
	}

	return {
		price: price.isSuccess ? Number(ethers.utils.formatEther(price.data!)) : null,
		rewardsInfo: rewardsInfo.data,
		distribution,
		apy: apy || null,
		queries,
	};
};
