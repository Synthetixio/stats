import { FC, useState, useEffect, useContext, useMemo } from 'react';
import snxData from 'synthetix-data';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';

import { COLORS } from 'constants/styles';
import { SNXJSContext, SNXContext, SUSDContext } from 'pages/_app';
import { FeePeriod, AreaChartData, ChartPeriod, ActiveStakersData } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';
import { NewParagraph, LinkText } from 'components/common';
import { synthetixSubgraph } from 'constants/links';

const Staking: FC = () => {
	const [currentFeePeriod, setCurrentFeePeriod] = useState<FeePeriod | null>(null);
	const [nextFeePeriod, setNextFeePeriod] = useState<FeePeriod | null>(null);
	const [stakersChartPeriod, setStakersChartPeriod] = useState<ChartPeriod>('Y');
	const [totalActiveStakers, setTotalActiveStakers] = useState<number | null>(null);
	const [stakersChartData, setStakersChartData] = useState<AreaChartData[]>([]);
	const snxjs = useContext(SNXJSContext);
	const { SNXPrice, SNXStaked } = useContext(SNXContext);
	const { sUSDPrice } = useContext(SUSDContext);

	useEffect(() => {
		const fetchFeePeriod = async (period: number): Promise<FeePeriod> => {
			const { formatEther } = snxjs.utils;
			const feePeriod = await snxjs.contracts.FeePool.recentFeePeriods(period);
			return {
				feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
				feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
				rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
				rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
			};
		};

		const fetchData = async () => {
			const [newFeePeriod, currFeePeriod] = await Promise.all([
				fetchFeePeriod(0),
				fetchFeePeriod(1),
			]);

			setCurrentFeePeriod(currFeePeriod);
			setNextFeePeriod(newFeePeriod);
		};
		fetchData();
	}, []);

	const formatChartData = (data: ActiveStakersData[]) =>
		(data as ActiveStakersData[]).map(({ id, count }) => {
			return {
				created: formatIdToIsoString(id, '1d'),
				value: count,
			};
		});

	const fetchNewChartData = async (fetchPeriod: ChartPeriod) => {
		let newStakersData = [];
		if (fetchPeriod === 'W') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 7 });
		} else if (fetchPeriod === 'M') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 30 });
		} else if (fetchPeriod === 'Y') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 365 });
		}
		newStakersData = newStakersData.reverse();
		setTotalActiveStakers(newStakersData[newStakersData.length - 1].count);
		setStakersChartData(formatChartData(newStakersData));
	};

	useEffect(() => {
		fetchNewChartData(stakersChartPeriod);
	}, [stakersChartPeriod]);

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const SNXValueStaked = useMemo(() => (SNXPrice ?? 0) * (SNXStaked ?? 0), [SNXPrice, SNXStaked]);
	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title="CURRENT SNX STAKING APY"
					num={
						sUSDPrice != null &&
						SNXPrice != null &&
						currentFeePeriod != null &&
						SNXValueStaked != null
							? (((sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute +
									(SNXPrice ?? 0) * currentFeePeriod.rewardsToDistribute) *
									52) /
							  SNXValueStaked
							: null
					}
					percentChange={null}
					subText="Current annual percentage yield from staking SNX"
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={
						<>
							To calculate the total APY for staking SNX, we combine the SNX rewards APY and sUSD
							rewards APY given in the previous fee period.{' '}
						</>
					}
				/>
				<StatsBox
					key="SNXSTKAPYSUSD"
					title="CURRENT SNX STAKING APY (sUSD REWARDS)"
					num={
						sUSDPrice != null && currentFeePeriod != null && SNXValueStaked != null
							? ((sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute * 52) / SNXValueStaked
							: null
					}
					percentChange={null}
					subText="Current annual sUSD yield for SNX stakers from Synth trading fees"
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="SNXSTKAPYSNX"
					title="CURRENT SNX STAKING APY (SNX REWARDS)"
					num={
						SNXPrice != null && currentFeePeriod != null && SNXValueStaked != null
							? (((SNXPrice ?? 0) * currentFeePeriod?.rewardsToDistribute ?? 0) * 52) /
							  SNXValueStaked
							: null
					}
					percentChange={null}
					subText="Current annual SNX yield for SNX stakers. This SNX comes from the inflationary SNX supply"
					color={COLORS.pink}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="CRRNTFEERWPOOLUSD"
					title="CURRENT FEE POOL (sUSD)"
					num={
						sUSDPrice != null && currentFeePeriod != null && sUSDPrice != null
							? (sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of all Synth trading fees both claimed and claimable in the current period"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<>
							SNX and sUSD rewards are paid weekly to stakers who maintain their collateral ratio of
							SNX/debt.{' '}
							<NewParagraph>
								Each week, stakers can claim Synth trading fees generated from the prior week.
							</NewParagraph>
						</>
					}
				/>
				<StatsBox
					key="CRRNTFEERWPOOLSNX"
					title="CURRENT REWARDS POOL (SNX)"
					num={
						currentFeePeriod != null && SNXPrice != null
							? (SNXPrice ?? 0) * currentFeePeriod.rewardsToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of all SNX staking rewards both claimed and claimable in the current period"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UNCLMFEESUSD"
					title="UNCLAIMED FEES AND REWARDS (USD)"
					num={
						currentFeePeriod != null && sUSDPrice != null && SNXPrice != null
							? (sUSDPrice ?? 0) *
									(currentFeePeriod.feesToDistribute - currentFeePeriod.feesClaimed) +
							  (SNXPrice ?? 0) *
									(currentFeePeriod.rewardsToDistribute - currentFeePeriod.rewardsClaimed)
							: null
					}
					percentChange={null}
					subText="The total value of all unclaimed Synth trading fees and SNX staking rewards in the current period"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UPCOMINGFEESUSD"
					title="FEES IN NEXT PERIOD (USD)"
					num={
						nextFeePeriod != null && sUSDPrice != null
							? (sUSDPrice ?? 0) * nextFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of Synth trading fees already accumulated in this fee period that are claimable in the next fee period"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
			</StatsRow>
			<AreaChart
				periods={stakingPeriods}
				activePeriod={stakersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setStakersChartData([]); // will force loading state
					setStakersChartPeriod(period);
					fetchNewChartData(period);
				}}
				data={stakersChartData}
				title="TOTAL ACTIVE STAKERS"
				num={totalActiveStakers}
				numFormat="number"
				percentChange={
					stakersChartData.length > 0 && totalActiveStakers != null
						? totalActiveStakers / stakersChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<>
						The number of total active stakers is obtained from the "TotalActiveStaker" entity from
						the <LinkText href={synthetixSubgraph}>Synthetix subgraph.</LinkText> The chart data
						shows the "TotalDailyActiveStaker" entity over time.{' '}
					</>
				}
			/>
		</>
	);
};

export default Staking;
