import { FC, useState, useEffect, useContext, useMemo } from 'react';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import { COLORS } from 'constants/styles';
import { SNXJSContext, SNXContext, SUSDContext } from 'pages/_app';
import { FeePeriod } from 'types/data';
import { LinkText, NewParagraph } from '../../components/common';

const Staking: FC = () => {
	const [currentFeePeriod, setCurrentFeePeriod] = useState<FeePeriod | null>(null);
	const [nextFeePeriod, setNextFeePeriod] = useState<FeePeriod | null>(null);
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

	const SNXValueStaked = useMemo(() => SNXPrice * SNXStaked, [SNXPrice, SNXStaked]);

	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title="CURRENT SNX STAKING APY"
					num={
						currentFeePeriod != null && SNXValueStaked != null
							? ((sUSDPrice * currentFeePeriod.feesToDistribute +
									SNXPrice * currentFeePeriod.rewardsToDistribute) *
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
							To calculate the APY for staking SNX, we sum both the SNX rewards APY and sUSD rewards
							APY given out each week.{' '}
							<NewParagraph>
								For a rewards breakdown of SNX vs sUSD, see the following 2 boxes.
							</NewParagraph>
						</>
					}
				/>
				<StatsBox
					key="SNXSTKAPYSUSD"
					title="CURRENT SNX STAKING APY (SUSD REWARDS)"
					num={
						currentFeePeriod != null && SNXValueStaked != null
							? (sUSDPrice * currentFeePeriod.feesToDistribute * 52) / SNXValueStaked
							: null
					}
					percentChange={null}
					subText="Current annual percentage yield from staking SNX from sUSD trading volume fees"
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="SNXSTKAPYSNX"
					title="CURRENT SNX STAKING APY (SNX rewards)"
					num={
						currentFeePeriod != null && SNXValueStaked != null
							? ((SNXPrice * currentFeePeriod?.rewardsToDistribute ?? 0) * 52) / SNXValueStaked
							: null
					}
					percentChange={null}
					subText="Current annual percentage yield from staking SNX from SNX rewards"
					color={COLORS.pink}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="CRRNTFEERWPOOLUSD"
					title="CURRENT FEE REWARDS POOL (USD)"
					num={
						currentFeePeriod != null && sUSDPrice != null
							? sUSDPrice * currentFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of all trading fee based rewards claimed and claimable in the current period"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<>
							SNX and sUSD rewards are paid weekly to stakers who maintain their collateral ratio of
							SNX/debt.{' '}
							<NewParagraph>
								Each week, stakers can claim trading fees generated from the prior week, meanwhile,
								new fees are accumulating for the following week based on trading activiy.
							</NewParagraph>
							<NewParagraph>
								This box as well as the next two boxes represent data for the fee/ rewards pool that
								is finalized and currently claimable.
							</NewParagraph>
						</>
					}
				/>
				<StatsBox
					key="CRRNTFEERWPOOLSNX"
					title="CURRENT FEE REWARDS POOL (SNX)"
					num={
						currentFeePeriod != null && SNXPrice != null
							? SNXPrice * currentFeePeriod.rewardsToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of all SNX rewards both claimed and claimable in the current period"
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
							? sUSDPrice * (currentFeePeriod.feesToDistribute - currentFeePeriod.feesClaimed) +
							  SNXPrice * (currentFeePeriod.rewardsToDistribute - currentFeePeriod.rewardsClaimed)
							: null
					}
					percentChange={null}
					subText="The total value of all unclaimed fees and rewards in the current period"
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
							? sUSDPrice * nextFeePeriod.feesToDistribute
							: null
					}
					percentChange={null}
					subText="The total value of all trading fee based rewards accumulated for the next period"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<>
							SNX and sUSD rewards are paid weekly to stakers who maintain their collateral ratio of
							SNX/debt.{' '}
							<NewParagraph>
								Each week, stakers can claim trading fees generated from the prior week, meanwhile,
								new fees are accumulating for the following week based on trading activiy.
							</NewParagraph>
							<NewParagraph>
								This box represents data for the fee pool that is accumulating for stakers to claim
								the following week.
							</NewParagraph>
							<NewParagraph>
								Note this box only represents trading fees for the next period and does not include
								SNX rewards, which are on a fixed schedule and decline by 1.25% week over week.
							</NewParagraph>
						</>
					}
				/>
			</StatsRow>
		</>
	);
};

export default Staking;
