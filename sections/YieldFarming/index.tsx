import { ethers } from 'ethers';
import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';

import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import StatsRow from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';
import {
	curvepoolRewards,
	iBtcRewards,
	iEth2Rewards,
	curveSusdPool,
	curveSusdPoolToken,
} from 'contracts';

import { COLORS } from 'constants/styles';
import { SNXJSContext, SNXContext } from 'pages/_app';
import { getAaveDepositRate } from 'utils/customGraphQueries';

const subtitleText = (name: string) =>
	`Data for Synthetix Liquidity Provider (LP) ${name} rewards program`;

type APYFields = {
	price: number;
	balanceOf: number;
};

const YieldFarming: FC = () => {
	const [distributions, setDistributions] = useState<{ [address: string]: number } | null>(null);
	const [aaveDepositRate, setAaveDepositRate] = useState<number | null>(null);
	const [iBtcAPYFields, setiBtcAPYFields] = useState<APYFields | null>(null);
	const [iEthAPYFields, setiEthAPYFields] = useState<APYFields | null>(null);
	const [curveAPYFields, setCurveAPYFields] = useState<APYFields | null>(null);
	const [curveSwapAPY, setCurveSwapAPY] = useState<number>(0);
	const snxjs = useContext(SNXJSContext);
	const { SNXPrice } = useContext(SNXContext);

	useEffect(() => {
		const curvepoolContract = new ethers.Contract(
			curvepoolRewards.address,
			curvepoolRewards.abi,
			ethers.getDefaultProvider()
		);
		const iEth2RewardsContract = new ethers.Contract(
			iEth2Rewards.address,
			iEth2Rewards.abi,
			ethers.getDefaultProvider()
		);
		const iBtcRewardsContract = new ethers.Contract(
			iBtcRewards.address,
			iBtcRewards.abi,
			ethers.getDefaultProvider()
		);
		const curveSusdPoolContract = new ethers.Contract(
			curveSusdPool.address,
			curveSusdPool.abi,
			ethers.getDefaultProvider()
		);
		const curveSusdPoolTokenContract = new ethers.Contract(
			curveSusdPoolToken.address,
			curveSusdPoolToken.abi,
			ethers.getDefaultProvider()
		);

		const fetchData = async () => {
			try {
				const contracts = [curvepoolContract, iEth2RewardsContract, iBtcRewardsContract];
				const rewardsData = await Promise.all(
					contracts.map((contract) => {
						const getDuration = contract.DURATION || contract.rewardsDuration;
						return Promise.all([getDuration(), contract.rewardRate(), contract.periodFinish()]);
					})
				);
				let contractRewards = {};
				rewardsData.forEach(([duration, rate, periodFinish], i) => {
					const durationInWeeks = Number(duration) / 3600 / 24 / 7;
					const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
					contractRewards[contracts[i].address] = isPeriodFinished
						? 0
						: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;
				});
				setDistributions(contractRewards);

				const fetchedData = await Promise.all([
					snxjs.contracts.ProxyiETH.balanceOf(iEth2Rewards.address),
					snxjs.contracts.ProxyiBTC.balanceOf(iBtcRewards.address),
					snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32('iETH')),
					snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32('iBTC')),
					curveSusdPoolTokenContract.balanceOf(curvepoolRewards.address),
					curveSusdPoolContract.get_virtual_price(),
					getAaveDepositRate(),
					axios.get('https://www.curve.fi/raw-stats/apys.json'),
				]);

				const [
					iEthBalance,
					iBtcBalance,
					iEthPrice,
					iBtcPrice,
					curveSusdBalance,
					curveSusdTokenPrice,
				] = fetchedData.slice(0, 6).map((data) => Number(snxjs.utils.formatEther(data)));

				setiBtcAPYFields({ balanceOf: iBtcBalance, price: iBtcPrice });
				setiEthAPYFields({ balanceOf: iEthBalance, price: iEthPrice });
				setCurveAPYFields({ balanceOf: curveSusdBalance, price: curveSusdTokenPrice });
				setAaveDepositRate(fetchedData[6]);

				const swapAPY = fetchedData[7]?.data?.apy?.day?.susd ?? 0;
				setCurveSwapAPY(swapAPY);
			} catch (e) {
				setDistributions(null);
			}
		};
		fetchData();
	}, []);

	return (
		<>
			<SectionHeader title="YIELD FARMING" />
			<SingleStatRow
				text="LENDING APY"
				subtext="The current APY for lending SNX on AAVE"
				num={aaveDepositRate}
				color={COLORS.green}
				numberStyle="percent2"
			/>
			<StatsRow>
				<DoubleStatsBox
					key="CRVSUSDRWRDS"
					title="Curvepool sUSD"
					subtitle={subtitleText('sUSD') + '. Excludes rewards from CRV tokens'}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={
						distributions != null ? distributions[curvepoolRewards.address] : distributions
					}
					firstColor={COLORS.pink}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={
						distributions != null && curveAPYFields != null
							? ((distributions[curvepoolRewards.address] * SNXPrice) /
									(curveAPYFields.balanceOf * curveAPYFields.price)) *
									52 +
							  curveSwapAPY
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
				/>
				<DoubleStatsBox
					key="iETHRWRDS"
					title="iETH"
					subtitle={subtitleText('iETH')}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={distributions != null ? distributions[iEth2Rewards.address] : distributions}
					firstColor={COLORS.green}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={
						distributions != null && iEthAPYFields != null
							? ((distributions[iEth2Rewards.address] * SNXPrice) /
									(iEthAPYFields.balanceOf * iEthAPYFields.price)) *
							  52
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
				/>
				<DoubleStatsBox
					key="iBTCRWRDS"
					title="iBTC"
					subtitle={subtitleText('iBTC')}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={distributions != null ? distributions[iBtcRewards.address] : distributions}
					firstColor={COLORS.green}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={
						distributions != null && iBtcAPYFields != null
							? ((distributions[iBtcRewards.address] * SNXPrice) /
									(iBtcAPYFields.balanceOf * iBtcAPYFields.price)) *
							  52
							: null
					}
					secondColor={COLORS.pink}
					secondMetricStyle="percent2"
				/>
			</StatsRow>
		</>
	);
};

export default YieldFarming;
