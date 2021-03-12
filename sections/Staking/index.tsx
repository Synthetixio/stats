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
	LiquidationsData,
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

	const { SNXPrice, SNXStaked, issuanceRatio } = useSNXInfo(snxjs);
	const { sUSDPrice } = useSUSDInfo(provider);

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

	const formattedLiquidationsData = (liquidations.data ?? []).sort(
		(a: LiquidationsData, b: LiquidationsData) => a.deadline - b.deadline
	);

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const SNXValueStaked = useMemo(() => (SNXPrice && SNXStaked ? SNXPrice * SNXStaked : null), [
		SNXPrice,
		SNXStaked,
	]);

	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title={t('current-staking-apy.title')}
					num={
						sUSDPrice != null &&
						SNXPrice != null &&
						currentFeePeriod.isSuccess &&
						SNXValueStaked != null
							? (((sUSDPrice ?? 0) * currentFeePeriod.data!.feesToDistribute +
									(SNXPrice ?? 0) * currentFeePeriod.data!.rewardsToDistribute) *
									52) /
							  SNXValueStaked
							: null
					}
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
					num={
						sUSDPrice != null && currentFeePeriod.isSuccess && SNXValueStaked != null
							? ((sUSDPrice ?? 0) * currentFeePeriod.data!.feesToDistribute * 52) / SNXValueStaked
							: null
					}
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
					num={
						SNXPrice != null && currentFeePeriod.isSuccess && SNXValueStaked != null
							? (((SNXPrice ?? 0) * currentFeePeriod?.data!.rewardsToDistribute ?? 0) * 52) /
							  SNXValueStaked
							: null
					}
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
			<Liquidations
				liquidationsData={formattedLiquidationsData}
				isLoading={liquidations.isFetching}
				issuanceRatio={issuanceRatio}
				snxPrice={SNXPrice}
			/>
		</>
	);
};

export default Staking;
