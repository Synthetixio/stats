import { FC, useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { format } from 'date-fns';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { l1Endpoints as l1GraphAPIEndpoints, DailyTotalActiveStakers } from '@synthetixio/data';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import _ from 'lodash';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import {
	NewParagraph,
	LinkText,
	SectionTitle,
	SectionSubtitle,
	FlexDiv,
	SectionWrap,
} from 'components/common';
import Table from 'components/Table';

import { COLORS, MAX_PAGE_WIDTH } from 'constants/styles';
import { AreaChartData, ChartPeriod } from 'types/data';
import { synthetixSubgraph } from 'constants/links';
import { useNetwork } from 'contexts/Network';
import NoNotificationIcon from 'assets/svg/no-notifications.svg';

import { useLiquidationsQuery } from 'queries/staking';
import { useSUSDInfo } from 'queries/shared/useSUSDInfo';
import { usePageResults } from 'queries/shared/usePageResults';
import {
	formatCurrency,
	formatIdToIsoString,
	getTimeLength,
	TimeSeriesType,
} from 'utils/formatter';
import { periodToDays } from 'utils/dataMapping';

import Liquidations from './Liquidations';

const WEEK = 86400 * 7 * 1000;

function formatChartData(data: DailyTotalActiveStakers[]): AreaChartData[] {
	return data.map(({ id, count }) => {
		return {
			created: id.toString(),
			value: count,
		};
	});
}

function formatLiquidationsChart(
	data: RawRecentLiquidation[],
	period: ChartPeriod,
	precision: TimeSeriesType
) {
	const chartData: AreaChartData[] = [];

	const curTime = Date.now() / 1000;
	const periodLength = periodToDays(period) * 86400;
	const precisionLength = getTimeLength(precision);

	for (const liquidation of data) {
		const time = parseInt(liquidation.time);

		if (time < curTime - periodLength) {
			continue;
		}

		const value = wei(liquidation.amountLiquidated, 18, true).toNumber();
		const timeBucket = new Date((time - (time % precisionLength)) * 1000).toISOString();
		if (_.last(chartData)?.created === timeBucket) {
			_.last(chartData)!.value += value;
		} else {
			chartData.push({
				created: timeBucket,
				value,
			});
		}
	}

	return _.reverse(chartData);
}

// todo: refactor
function formatDebtChart(
	data: RawDebtState[],
	property: keyof RawDebtState,
	period: ChartPeriod,
	precision: TimeSeriesType
) {
	const chartData: AreaChartData[] = [];

	const curTime = Date.now() / 1000;
	const periodLength = periodToDays(period) * 86400;
	const precisionLength = getTimeLength(precision);

	for (const debtState of data) {
		const time = parseInt(debtState.timestamp);

		if (time < curTime - periodLength) {
			continue;
		}

		if (!debtState[property]) continue;

		let value = wei(debtState[property]).toNumber();

		const timeBucket = new Date((time - (time % precisionLength)) * 1000).toISOString();
		if (_.last(chartData)?.created === timeBucket) {
			_.last(chartData)!.value = value;
		} else {
			chartData.push({
				created: timeBucket,
				value,
			});
		}
	}

	return _.reverse(chartData.slice(1, chartData.length - 1));
}

interface RawRecentLiquidation {
	account: string;
	liquidator: string;
	amountLiquidated: string;
	time: string;
}

interface RawDebtState {
	timestamp: string;
	totalIssuedSynths: string;
	debtEntry: string;
	debtRatio: string;
	snxSupply: string;
}

const Staking: FC = () => {
	const { t } = useTranslation();

	const { isL2 } = useNetwork();

	const [stakersChartPeriod, setStakersChartPeriod] = useState<ChartPeriod>('Y');
	const [liquidationsChartPeriod, setLiquidationsChartPeriod] = useState<ChartPeriod>('M');
	const [totalIssuedSynthsChartPeriod, setTotalIssuedSynthsChartPeriod] = useState<ChartPeriod>(
		'M'
	);

	const liquidationsChartPrecision = liquidationsChartPeriod === 'W' ? '15m' : '1d';
	const totalIssuedSynthsChartPrecision = liquidationsChartPeriod === 'W' ? '15m' : '1d';

	const { provider } = useNetwork();

	const { sUSDPrice, sUSDPriceQuery } = useSUSDInfo(provider);

	const {
		useGetFeePoolDataQuery,
		useGlobalStakingInfoQuery,
		useDailyTotalActiveStakersQuery,
	} = useSynthetixQueries();
	const currentFeePeriod = useGetFeePoolDataQuery(1);
	const nextFeePeriod = useGetFeePoolDataQuery(0);

	const globalStakingInfoQuery = useGlobalStakingInfoQuery();
	const {
		snxPrice: SNXPrice,
		lockedValue: SNXValueStaked,
		issuanceRatio,
		totalIssuedSynths,
	} = globalStakingInfoQuery.isSuccess
		? globalStakingInfoQuery.data
		: {
				snxPrice: wei(0),
				lockedValue: wei(0),
				issuanceRatio: wei(0),
				totalIssuedSynths: wei(0),
		  };

	const activeStakersData = useDailyTotalActiveStakersQuery({
		max: periodToDays(stakersChartPeriod),
	});

	const liquidations = useLiquidationsQuery();

	const recentLiquidationsQuery = usePageResults<RawRecentLiquidation[]>({
		api: l1GraphAPIEndpoints.liquidations,
		query: {
			entity: 'accountLiquidateds',
			selection: {
				orderBy: 'time',
				orderDirection: 'desc',
				first: 1000,
			},
			properties: ['account', 'liquidator', 'amountLiquidated', 'time'],
		},
	});

	const globalDebtOverTimeQuery = usePageResults<RawDebtState[]>({
		api: isL2
			? 'https://api.thegraph.com/subgraphs/name/killerbyte/optimism-global-debt'
			: 'https://api.thegraph.com/subgraphs/name/killerbyte/synthetix-global-debt',
		max: 5000,
		query: {
			entity: 'debtStates',
			selection: {
				orderBy: 'timestamp',
				orderDirection: 'desc',
				first: 1000,
			},
			properties: ['timestamp', 'totalIssuedSynths', 'debtEntry', 'debtRatio', 'snxSupply'],
		},
	});

	let stakersChartData: AreaChartData[] = [];

	let totalActiveStakers: number | null = null;
	if (activeStakersData.isSuccess) {
		const d = activeStakersData.data!.slice(0).reverse();
		stakersChartData = formatChartData(d);
		totalActiveStakers = d[d.length - 1].count;
	}

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];

	const recentLiquidatedChartData = useMemo<AreaChartData[]>(
		() =>
			recentLiquidationsQuery.isSuccess
				? formatLiquidationsChart(
						recentLiquidationsQuery.data!,
						liquidationsChartPeriod,
						liquidationsChartPrecision
				  )
				: [],
		[
			recentLiquidationsQuery.isSuccess,
			recentLiquidationsQuery.data,
			liquidationsChartPeriod,
			liquidationsChartPrecision,
		]
	);

	const totalIssuedSynthsChartData = useMemo<AreaChartData[]>(
		() =>
			globalDebtOverTimeQuery.isSuccess
				? formatDebtChart(
						globalDebtOverTimeQuery.data!,
						'totalIssuedSynths',
						totalIssuedSynthsChartPeriod,
						totalIssuedSynthsChartPrecision
				  )
				: [],
		[
			globalDebtOverTimeQuery.isSuccess,
			globalDebtOverTimeQuery.data,
			totalIssuedSynthsChartPeriod,
			totalIssuedSynthsChartPrecision,
		]
	);

	const snxSupplyChartData = useMemo<AreaChartData[]>(
		() =>
			globalDebtOverTimeQuery.isSuccess
				? formatDebtChart(
						globalDebtOverTimeQuery.data!,
						'snxSupply',
						totalIssuedSynthsChartPeriod,
						totalIssuedSynthsChartPrecision
				  )
				: [],
		[
			globalDebtOverTimeQuery.isSuccess,
			globalDebtOverTimeQuery.data,
			totalIssuedSynthsChartPeriod,
			totalIssuedSynthsChartPrecision,
		]
	);

	let stakeApySnx: Wei | null = null;
	let stakeApyFees: Wei | null = null;

	if (
		sUSDPrice != null &&
		SNXPrice != null &&
		SNXPrice.gt(0) &&
		issuanceRatio != null &&
		currentFeePeriod.isSuccess &&
		totalIssuedSynths != null &&
		totalIssuedSynths.gt(0) &&
		SNXValueStaked != null
	) {
		const fakeSnxStaked = wei(1000);
		const fakesUSDMinted = fakeSnxStaked.mul(SNXPrice).mul(issuanceRatio);
		const feePoolPortion = fakesUSDMinted.div(totalIssuedSynths);
		const usdThisWeek = wei(sUSDPrice)
			.mul(currentFeePeriod.data!.feesToDistribute)
			.mul(feePoolPortion);
		const snxThisWeek = currentFeePeriod.data!.rewardsToDistribute.mul(feePoolPortion);

		stakeApySnx = snxThisWeek.mul(365.0 / 7).div(fakeSnxStaked);
		stakeApyFees = usdThisWeek.mul(365.0 / 7).div(SNXPrice.mul(fakeSnxStaked));
	}

	return (
		<>
			<SectionHeader title="STAKING" />
			<StatsRow>
				<StatsBox
					key="SNXSTKAPY"
					title={t('current-staking-apy.title')}
					num={stakeApyFees && stakeApySnx ? stakeApyFees.add(stakeApySnx) : null}
					queries={[sUSDPriceQuery, globalStakingInfoQuery, currentFeePeriod]}
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
					queries={[sUSDPriceQuery, globalStakingInfoQuery, currentFeePeriod]}
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
					queries={[sUSDPriceQuery, globalStakingInfoQuery, currentFeePeriod]}
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
							? currentFeePeriod.data!.feesToDistribute.mul(wei(sUSDPrice ?? 0))
							: null
					}
					queries={[sUSDPriceQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('current-fee-pool.subtext', {
						endDate: currentFeePeriod.isSuccess
							? format(new Date(currentFeePeriod.data!.startTime * 1000 + WEEK), 'MMMM dd')
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
							? SNXPrice.mul(currentFeePeriod.data!.rewardsToDistribute)
							: null
					}
					queries={[globalStakingInfoQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('current-fee-pool-snx.subtext', {
						endDate: currentFeePeriod.isSuccess
							? format(new Date(currentFeePeriod.data!.startTime * 1000 + WEEK), 'MMMM dd')
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
							? wei(sUSDPrice ?? 0)
									.mul(
										currentFeePeriod.data!.feesToDistribute.sub(currentFeePeriod.data!.feesClaimed)
									)
									.add(
										SNXPrice.mul(
											currentFeePeriod.data!.rewardsToDistribute.sub(
												currentFeePeriod.data!.rewardsClaimed
											)
										)
									)
							: null
					}
					queries={[sUSDPriceQuery, globalStakingInfoQuery, currentFeePeriod]}
					percentChange={null}
					subText={t('unclaimed-fees-and-rewards.subtext', {
						endDate: nextFeePeriod.isSuccess
							? format(new Date(nextFeePeriod.data!.startTime * 1000 + WEEK), 'MMMM dd')
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
							? wei(sUSDPrice ?? 0).mul(nextFeePeriod.data!.feesToDistribute)
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
				activePeriod={totalIssuedSynthsChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTotalIssuedSynthsChartPeriod(period);
				}}
				data={snxSupplyChartData}
				isLoadingData={globalDebtOverTimeQuery.isLoading}
				title={t('snx-supply.title')}
				num={_.last(snxSupplyChartData)?.value || 0}
				numFormat="number"
				percentChange={
					snxSupplyChartData.length
						? _.last(snxSupplyChartData)!.value / snxSupplyChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="snx-supply.infoData"
						components={{
							linkText: <LinkText href={synthetixSubgraph} />,
						}}
					/>
				}
			/>
			<AreaChart
				periods={stakingPeriods}
				activePeriod={totalIssuedSynthsChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTotalIssuedSynthsChartPeriod(period);
				}}
				data={totalIssuedSynthsChartData}
				isLoadingData={globalDebtOverTimeQuery.isLoading}
				title={t('total-issued-synths.title')}
				num={_.last(totalIssuedSynthsChartData)?.value || 0}
				numFormat="number"
				percentChange={
					totalIssuedSynthsChartData.length
						? _.last(totalIssuedSynthsChartData)!.value / totalIssuedSynthsChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="total-issued-synths.infoData"
						components={{
							linkText: <LinkText href={synthetixSubgraph} />,
						}}
					/>
				}
			/>
			<AreaChart
				periods={stakingPeriods}
				activePeriod={stakersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setStakersChartPeriod(period);
				}}
				data={stakersChartData}
				isLoadingData={activeStakersData.isLoading}
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

			{isL2 ? null : (
				<>
					<StatsRow>
						<StatsBox
							key="LIQUIDCOUNT"
							title={t('liquidation-count.title')}
							num={liquidations.summary.liquidatableCount}
							queries={liquidations.queries}
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
							num={liquidations.summary.amountToCover}
							queries={liquidations.queries}
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
							num={liquidations.summary.totalLiquidatableSNX}
							queries={liquidations.queries}
							percentChange={null}
							subText={t('liquidation-snx-total.subtext')}
							color={COLORS.pink}
							numberStyle="number"
							numBoxes={3}
							infoData={null}
						/>
					</StatsRow>
					<Liquidations
						liquidationsData={_.reverse(_.sortBy(liquidations.liquidations, 'amountToCover'))}
						isLoading={liquidations.isFetching}
						issuanceRatio={issuanceRatio.toNumber()}
						snxPrice={SNXPrice.toNumber()}
					/>

					<AreaChart
						periods={stakingPeriods}
						activePeriod={liquidationsChartPeriod}
						onPeriodSelect={(period: ChartPeriod) => {
							setLiquidationsChartPeriod(period);
						}}
						data={recentLiquidatedChartData}
						isLoadingData={recentLiquidationsQuery.isLoading}
						title={t('recent-liquidations-chart.title')}
						numFormat="currency0"
						num={null}
						percentChange={null}
						timeSeries={liquidationsChartPrecision}
						infoData={<Trans i18nKey="recent-liquidations.infoData" />}
					/>
					{recentLiquidationsQuery.isSuccess /* have to do this because our table is broken */ && (
						<SectionWrap>
							<SectionTitle>{t('recent-liquidations.title')}</SectionTitle>
							<SectionSubtitle>{t('recent-liquidations.subtitle')}</SectionSubtitle>
							<Table
								columns={[
									{
										Header: (
											<StyledTableHeader>{t('recent-liquidations.columns.time')}</StyledTableHeader>
										),
										accessor: 'time',
										Cell: (cellProps: CellProps<RawRecentLiquidation>) => (
											<InterSpan>
												{new Date(1000 * parseInt(cellProps.row.original.time)).toISOString()}
											</InterSpan>
										),
										width: 100,
									},
									{
										Header: (
											<StyledTableHeader>
												{t('recent-liquidations.columns.account')}
											</StyledTableHeader>
										),
										accessor: 'account',
										Cell: (cellProps: CellProps<RawRecentLiquidation>) => (
											<InterSpan>{cellProps.row.original.account}</InterSpan>
										),
									},
									{
										Header: (
											<StyledTableHeader>
												{t('recent-liquidations.columns.liquidator')}
											</StyledTableHeader>
										),
										accessor: 'liquidator',
										Cell: (cellProps: CellProps<RawRecentLiquidation>) => (
											<InterSpan>{cellProps.row.original.liquidator}</InterSpan>
										),
									},
									{
										Header: (
											<StyledTableHeader>
												{t('recent-liquidations.columns.amount')}
											</StyledTableHeader>
										),
										accessor: 'amountLiquidated',
										Cell: (cellProps: CellProps<RawRecentLiquidation>) => (
											<InterSpan>
												{formatCurrency(
													Number(
														ethers.utils.formatEther(
															ethers.BigNumber.from(cellProps.row.original.amountLiquidated)
														)
													),
													0
												)}
											</InterSpan>
										),
										width: 50,
									},
								]}
								data={recentLiquidationsQuery.data.slice(100)}
								isLoading={recentLiquidationsQuery.isLoading}
								noResultsMessage={
									!recentLiquidationsQuery.isLoading &&
									recentLiquidationsQuery.data?.length === 0 ? (
										<TableNoResults>
											<NoNotificationIcon />
											<NoResults>{t('recent-liquidations.no-results')}</NoResults>
										</TableNoResults>
									) : undefined
								}
								showPagination={true}
							/>
						</SectionWrap>
					)}
				</>
			)}
		</>
	);
};

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 13px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.white};
`;

const InterSpan = styled.span`
	font-family: 'Inter', sans-serif;
`;

const TableNoResults = styled(FlexDiv)`
	padding: 70px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	color: ${(props) => props.theme.colors.white};
	margin-top: -2px;
	align-items: center;
	display: flex;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0px auto;
`;

const NoResults = styled.span`
	margin-left: 10px;
`;

export default Staking;
