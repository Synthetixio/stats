import { FC, useState, useEffect, useContext, useMemo } from 'react';
import SectionHeader from '../../components/SectionHeader';
import StatsRow from '../../components/StatsRow';
import StatsBox from '../../components/StatsBox';
import { COLORS } from '../../constants/styles';
import { SNXJSContext, SNXContext, SUSDContext } from '../../pages/_app';
import { FeePeriod } from '../../types/data';

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
						(((sUSDPrice * currentFeePeriod?.feesToDistribute ?? 0) +
							(SNXPrice * currentFeePeriod?.rewardsToDistribute ?? 0)) *
							52) /
						SNXValueStaked
					}
					percentChange={null}
					subText="Annual percentage yield from staking SNX. Not assuming compounded interest."
					color={COLORS.green}
					numberStyle="percent"
					numBoxes={3}
				/>
				<StatsBox
					key="SNXSTKAPYSUSD"
					title="CURRENT SNX STAKING APY (sUSD fees)"
					num={((sUSDPrice * currentFeePeriod?.feesToDistribute ?? 0) * 52) / SNXValueStaked}
					percentChange={null}
					subText="Annual percentage yield from staking SNX in sUSD trading volume fees. Not assuming compounded interest."
					color={COLORS.green}
					numberStyle="percent"
					numBoxes={3}
				/>
				<StatsBox
					key="SNXSTKAPYSNX"
					title="CURRENT SNX STAKING APY (SNX rewards)"
					num={((SNXPrice * currentFeePeriod?.rewardsToDistribute ?? 0) * 52) / SNXValueStaked}
					percentChange={null}
					subText="Annual percentage yield from staking SNX in SNX rewards. Not assuming compounded interest."
					color={COLORS.pink}
					numberStyle="percent"
					numBoxes={3}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="CRRNTFEERWPOOLUSD"
					title="CURRENT FEE REWARDS POOL (USD)"
					num={sUSDPrice * currentFeePeriod?.feesToDistribute ?? 0}
					percentChange={null}
					subText="The total value of all trading fee based rewards claimed and claimable in the current period."
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
				/>
				<StatsBox
					key="CRRNTFEERWPOOLSNX"
					title="CURRENT FEE REWARDS POOL (SNX)"
					num={SNXPrice * currentFeePeriod?.rewardsToDistribute ?? 0}
					percentChange={null}
					subText="The total value of all SNX rewards both claimed and claimable in the current period."
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
				/>
				<StatsBox
					key="UNCLMFEESUSD"
					title="UNCLAIMED FEES AND REWARDS (USD)"
					num={
						sUSDPrice *
							((currentFeePeriod?.feesToDistribute ?? 0) - (currentFeePeriod?.feesClaimed ?? 0)) +
						SNXPrice *
							((currentFeePeriod?.rewardsToDistribute ?? 0) -
								(currentFeePeriod?.rewardsClaimed ?? 0))
					}
					percentChange={null}
					subText="The total value of all unclaimed fees and rewards in the current period."
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
				/>
				<StatsBox
					key="UPCOMINGFEESUSD"
					title="FEES AND REWARDS IN NEXT PERIOD (USD)"
					num={
						(SNXPrice * nextFeePeriod?.rewardsToDistribute ?? 0) +
						(sUSDPrice * nextFeePeriod?.feesToDistribute ?? 0)
					}
					percentChange={null}
					subText="The total value of all trading fee based rewards accumulated for the next period."
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
				/>
			</StatsRow>
		</>
	);
};

export default Staking;
