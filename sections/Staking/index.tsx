import { FC, useState, useContext, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { format } from 'date-fns';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { NewParagraph, LinkText } from 'components/common';

import {
	useFeePeriodQuery,
	useLiquidationsQuery,
	useAggregateActiveStakersQuery,
} from 'queries/staking';
import { COLORS } from 'constants/styles';
import { ProviderContext, SNXJSContext } from 'pages/_app';
import { ActiveStakersData, AreaChartData, ChartPeriod } from 'types/data';
import { synthetixSubgraph } from 'constants/links';

import Liquidations from './Liquidations';
import { useSNXInfo } from 'queries/shared/useSNXInfo';
import { useSUSDInfo } from 'queries/shared/useSUSDInfo';
import { formatIdToIsoString } from 'utils/formatter';
import { periodToDays } from 'utils/dataMapping';
import _ from 'lodash';

const WEEK = 86400 * 7 * 1000;

function formatChartData(data: ActiveStakersData[]) {
	return data.map(({ id, count }) => {
		return {
			created: formatIdToIsoString(id, '1d'),
			value: count,
		};
	});
}

const Staking: FC = () => {
	const { t } = useTranslation();

	const [stakersChartPeriod, setStakersChartPeriod] = useState<ChartPeriod>('Y');

	const snxjs = useContext(SNXJSContext);
	const provider = useContext(ProviderContext);

	const {
		SNXPrice,
		SNXStaked,
		issuanceRatio,
		totalIssuedSynths,

		SNXPriceQuery,
		issuanceRatioQuery,
		totalIssuedSynthsQuery,
	} = useSNXInfo(snxjs);
	const { sUSDPrice, sUSDPriceQuery } = useSUSDInfo(provider);

	const currentFeePeriod = useFeePeriodQuery(snxjs, 1);
	const nextFeePeriod = useFeePeriodQuery(snxjs, 0);

	const activeStakersData = useAggregateActiveStakersQuery({
		max: periodToDays(stakersChartPeriod),
	});

	const liquidations = useLiquidationsQuery();

	let stakersChartData: AreaChartData[] = [];
	let totalActiveStakers: number | null = null;
	if (activeStakersData.isSuccess) {
		const d = activeStakersData.data!;
		stakersChartData = formatChartData(d);
		totalActiveStakers = d[d.length - 1].count;
	}

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const SNXValueStaked = useMemo(() => (SNXPrice && SNXStaked ? SNXPrice * SNXStaked : null), [
		SNXPrice,
		SNXStaked,
	]);

	let stakeApySnx: number | null = null;
	let stakeApyFees: number | null = null;

	if (
		sUSDPrice != null &&
		SNXPrice != null &&
		issuanceRatio != null &&
		currentFeePeriod.isSuccess &&
		totalIssuedSynths != null &&
		SNXValueStaked != null
	) {
		const fakeSnxStaked = 1000;
		const fakesUSDMinted = fakeSnxStaked * SNXPrice * issuanceRatio;
		const feePoolPortion = fakesUSDMinted / totalIssuedSynths;
		const usdThisWeek = sUSDPrice * currentFeePeriod.data!.feesToDistribute * feePoolPortion;
		const snxThisWeek = currentFeePeriod.data!.rewardsToDistribute * feePoolPortion;

		stakeApySnx = (snxThisWeek * (365.0 / 7)) / fakeSnxStaked;
		stakeApyFees = (usdThisWeek * (365.0 / 7)) / (SNXPrice * fakeSnxStaked);
	}

	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title={t('current-staking-apy.title')}
					num={stakeApyFees && stakeApySnx ? stakeApyFees + stakeApySnx : null}
					queries={[
						sUSDPriceQuery,
						SNXPriceQuery,
						issuanceRatioQuery,
						totalIssuedSynthsQuery,
						currentFeePeriod,
					]}
					percentChange={null}
					subText={t('current-staking-apy.subtext')}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={t('current-staking-apy.infoData')}
				/>
				<StatsBox
					key="SNXSTKAPYSUSD"
					title={t('current-staking-apy-susd.title')}
					num={stakeApyFees}
					queries={[
						sUSDPriceQuery,
						SNXPriceQuery,
						issuanceRatioQuery,
						totalIssuedSynthsQuery,
						currentFeePeriod,
					]}
					percentChange={null}
					subText={t('current-staking-apy-susd.subtext')}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="SNXSTKAPYSNX"
					title={t('current-staking-apy-snx.title')}
					num={stakeApySnx}
					queries={[
						sUSDPriceQuery,
						SNXPriceQuery,
						issuanceRatioQuery,
						totalIssuedSynthsQuery,
						currentFeePeriod,
					]}
					percentChange={null}
					subText={t('current-staking-apy-snx.subtext')}
					color={COLORS.pink}
					numberStyle="percent2"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="CRRNTFEERWPOOLUSD"
					title={t('current-fee-pool.title')}
					num={
						sUSDPrice != null && currentFeePeriod.isSuccess && sUSDPrice != null
							? (sUSDPrice ?? 0) * currentFeePeriod.data!.feesToDistribute
							: null
					}
					queries={[sUSDPriceQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('current-fee-pool.subtext', {
						endDate: currentFeePeriod.isSuccess
							? format(new Date(currentFeePeriod.data!.startTime + WEEK), 'MMMM dd')
							: '-',
					})}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="current-fee-pool.infoData"
							components={{
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="CRRNTFEERWPOOLSNX"
					title={t('current-fee-pool-snx.title')}
					num={
						currentFeePeriod.isSuccess && SNXPrice != null
							? (SNXPrice ?? 0) * currentFeePeriod.data!.rewardsToDistribute
							: null
					}
					queries={[SNXPriceQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('current-fee-pool-snx.subtext', {
						endDate: currentFeePeriod.isSuccess
							? format(new Date(currentFeePeriod.data!.startTime + WEEK), 'MMMM dd')
							: '-',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UNCLMFEESUSD"
					title={t('unclaimed-fees-and-rewards.title')}
					num={
						currentFeePeriod.isSuccess && sUSDPrice != null && SNXPrice != null
							? (sUSDPrice ?? 0) *
									(currentFeePeriod.data!.feesToDistribute - currentFeePeriod.data!.feesClaimed) +
							  (SNXPrice ?? 0) *
									(currentFeePeriod.data!.rewardsToDistribute -
										currentFeePeriod.data!.rewardsClaimed)
							: null
					}
					queries={[sUSDPriceQuery, SNXPriceQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('unclaimed-fees-and-rewards.subtext', {
						endDate: nextFeePeriod.isSuccess
							? format(new Date(nextFeePeriod.data!.startTime + WEEK), 'MMMM dd')
							: '-',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="UPCOMINGFEESUSD"
					title={t('fees-in-next-period.title')}
					num={
						nextFeePeriod.isSuccess && sUSDPrice != null
							? (sUSDPrice ?? 0) * nextFeePeriod.data!.feesToDistribute
							: null
					}
					queries={[sUSDPriceQuery, nextFeePeriod]}
					percentChange={null}
					subText={t('fees-in-next-period.subtext')}
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
					setStakersChartPeriod(period);
				}}
				data={stakersChartData}
				title={t('total-active-stakers.title')}
				num={totalActiveStakers}
				numFormat="number"
				percentChange={
					stakersChartData.length > 0 && totalActiveStakers != null
						? totalActiveStakers / stakersChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="total-active-stakers.infoData"
						components={{
							linkText: <LinkText href={synthetixSubgraph} />,
						}}
					/>
				}
			/>
			<StatsRow>
				<StatsBox
					key="LIQUIDCOUNT"
					title={t('liquidation-count.title')}
					num={liquidations.isSuccess ? liquidations.data[0].liquidatableCount : null}
					queries={[liquidations]}
					percentChange={null}
					subText={t('liquidation-count.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="LIQUIDAMOUNT"
					title={t('liquidation-amount-to-cover.title')}
					num={liquidations.isSuccess ? liquidations.data[0].amountToCover : null}
					queries={[liquidations]}
					percentChange={null}
					subText={t('liquidation-amount-to-cover.subtext')}
					color={COLORS.pink}
					numberStyle="currency2"
					numBoxes={3}
					infoData={null}
				/>
				<StatsBox
					key="LIQUIDABLE"
					title={t('liquidation-snx-total.title')}
					num={liquidations.isSuccess ? liquidations.data[0].totalLiquidatableSNX : null}
					queries={[liquidations]}
					percentChange={null}
					subText={t('liquidation-snx-total.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<Liquidations
				liquidationsData={
					liquidations.isSuccess ? _.reverse(_.sortBy(liquidations.data![1], 'amountToCover')) : []
				}
				isLoading={liquidations.isFetching}
				issuanceRatio={issuanceRatio}
				snxPrice={SNXPrice}
			/>
		</>
	);
};

export default Staking;
