import { FC, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import styled from 'styled-components';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { COLORS, MAX_PAGE_WIDTH } from 'constants/styles';
import { ChartPeriod, AreaChartData, TradesRequestData } from 'types/data';
import { formatCurrency, formatIdToIsoString } from 'utils/formatter';
import { LinkText, FullLineLink, NewParagraph, SectionWrap, SectionTitle } from 'components/common';
import {
	synthetixExchangesSubgraph,
	githubSubgraph,
	etherscanArchernarBlock,
	frontRunningWiki,
} from 'constants/links';
import { usePageResults } from 'queries/shared/usePageResults';
import { synthetixExchanges, synthetixExchanger } from 'constants/graph-urls';
import { useTradesOverPeriodQuery, useGeneralTradingInfoQuery } from 'queries/trading';
import { periodToDays } from 'utils/dataMapping';
import Table from 'components/Table';
import { CellProps } from 'react-table';
import { Skeleton } from '@material-ui/lab';
import _ from 'lodash';
import Select from 'components/Select';

function getTotalValue(data: AreaChartData[]): number {
	return data.reduce((acc, curr) => (acc += curr.value), 0);
}

function formatChartData(data: TradesRequestData[], type: 'trade' | 'volume'): AreaChartData[] {
	return data.map(({ id, trades, exchangeUSDTally }) => ({
		created: formatIdToIsoString(id, '1d'),
		value: type === 'trade' ? trades : exchangeUSDTally,
	}));
}

interface ExchangePartnerData {
	dayID: string;
	id: string;
	partner: string;
	trades: string;
	usdFees: string;
	usdVolume: string;
}

function reducePartnerData(partnerData: ExchangePartnerData[], limitDays: number) {
	if (!partnerData.length) return [];

	const oldestDayId = Number(partnerData[0].dayID) - limitDays;

	const groupedPartnerData: {
		[partner: string]: { partner: string; usdFees: number; usdVolume: number; trades: number };
	} = {};

	for (const vd of partnerData) {
		if (oldestDayId >= Number(vd.dayID)) break;

		if (groupedPartnerData[vd.partner]) {
			groupedPartnerData[vd.partner].usdFees += Number(vd.usdFees);
			groupedPartnerData[vd.partner].usdVolume += Number(vd.usdVolume);
			groupedPartnerData[vd.partner].trades += Number(vd.trades);
		} else {
			groupedPartnerData[vd.partner] = {
				partner: vd.partner,
				usdFees: Number(vd.usdFees),
				usdVolume: Number(vd.usdVolume),
				trades: Number(vd.trades),
			};
		}
	}

	return _.values(groupedPartnerData);
}

const Trading: FC = () => {
	const { t } = useTranslation();

	const [tradesChartPeriod, setTradesChartPeriod] = useState<ChartPeriod>('M');
	const [volumeChartPeriod, setVolumeChartPeriod] = useState<ChartPeriod>('M');

	const [partnerTablePeriod, setPartnerTablePeriod] = useState<any>({
		label: t('time-periods.month'),
		value: 'M',
	});
	const [partnerTableCategory, setPartnerTableCategory] = useState<any>({
		label: t('volume-sources.columns.usdVolume'),
		value: 'usdVolume',
	});

	const tradesChartPeriodDays = periodToDays(tradesChartPeriod);
	const volumeChartPeriodDays = periodToDays(volumeChartPeriod);

	const generalTradingInfo = useGeneralTradingInfoQuery();

	const exchangeVolumeData = usePageResults<any>({
		api: synthetixExchanges,
		query: {
			entity: 'postArchernarTotals',
			selection: {
				where: {
					id: `\\"mainnet\\"`,
				},
			},
			properties: ['trades', 'exchangers', 'exchangeUSDTally', 'totalFeesGeneratedInUSD'],
		},
		max: 1,
	});

	const partnerData = usePageResults<any>({
		api: synthetixExchanger,
		query: {
			entity: 'dailyExchangePartners',
			selection: {
				orderBy: 'dayID',
				orderDirection: 'desc',
			},
			properties: ['dayID', 'partner', 'usdFees', 'usdVolume', 'trades'],
		},
	});

	const timeSeries = '1d';

	const tradesChartData = useTradesOverPeriodQuery({ timeSeries, max: tradesChartPeriodDays });
	const volumeChartData = useTradesOverPeriodQuery({ timeSeries, max: volumeChartPeriodDays });
	const monthlyTradersData = useTradesOverPeriodQuery({ timeSeries, max: 30 });

	const totalTradingVolume = exchangeVolumeData.isSuccess
		? exchangeVolumeData.data![0].exchangeUSDTally / 1e18
		: null;
	const totalTradingFees = exchangeVolumeData.isSuccess
		? exchangeVolumeData.data![0].totalFeesGeneratedInUSD / 1e18
		: null;
	const totalTrades = exchangeVolumeData.isSuccess ? exchangeVolumeData.data![0].trades : null;

	const tradesFormattedChartData = formatChartData(tradesChartData.data || [], 'trade');
	const volumeFormattedChartData = formatChartData(volumeChartData.data || [], 'volume');

	const totalTradesOverPeriod = getTotalValue(tradesFormattedChartData);
	const totalVolumeOverPeriod = getTotalValue(volumeFormattedChartData);

	const totalMonthlyTraders = monthlyTradersData.isSuccess
		? monthlyTradersData.data!.reduce((acc: number, { exchangers }: TradesRequestData) => {
				acc += exchangers;
				return acc;
		  }, 0)
		: null;
	const averageDailyTraders = totalMonthlyTraders ? Math.floor(totalMonthlyTraders / 30) : null;

	const periods: ChartPeriod[] = ['W', 'M', 'Y'];

	const reducedPartnerData = partnerData.isSuccess
		? reducePartnerData(partnerData.data, periodToDays(partnerTablePeriod.value))
		: [];

	console.log('reduced part data', reducedPartnerData);

	return (
		<>
			<SectionHeader title={t('section-header.trading')} />
			<StatsRow>
				<StatsBox
					key="TOTALTRDVOLUME"
					title={t('total-trading-volume.title')}
					num={totalTradingVolume}
					queries={[exchangeVolumeData]}
					percentChange={null}
					subText={t('total-trading-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="total-trading-volume.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLFEES"
					title={t('total-trading-fees.title')}
					num={totalTradingFees}
					queries={[exchangeVolumeData]}
					percentChange={null}
					subText={t('total-trading-fees.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="total-trading-fees.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLNOTRDES"
					title={t('total-number-of-trades.title')}
					num={totalTrades}
					queries={[exchangeVolumeData]}
					percentChange={null}
					subText={t('total-number-of-trades.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="total-number-of-trades.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLDAILYVOLUME"
					title={t('24hr-exchange-volume.title')}
					num={generalTradingInfo.data?.totalDailyTradingVolume || null}
					queries={[generalTradingInfo]}
					percentChange={null}
					subText={t('24hr-exchange-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
			</StatsRow>
			<AreaChart
				periods={periods}
				activePeriod={volumeChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setVolumeChartPeriod(period);
				}}
				data={volumeFormattedChartData}
				title={t('trading-volume.title')}
				num={totalVolumeOverPeriod}
				numFormat="currency0"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="trading-volume.infoData"
						components={{
							linkText: <LinkText href={synthetixExchangesSubgraph} />,
							linkText2: <LinkText href={etherscanArchernarBlock} />,
							linkText3: <LinkText href={frontRunningWiki} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<VolumeSourcesRow>
				<VolumeSourcesContainer>
					<SectionTitle>{t('volume-sources.title')}</SectionTitle>
					<VolumeSourcesOptions>
						<VolumeSourcesOptionsLabel>
							{t('volume-sources.labels.period')}:
						</VolumeSourcesOptionsLabel>
						<Select
							onChange={setPartnerTablePeriod}
							value={partnerTablePeriod}
							options={[
								{
									value: 'W',
									label: t('time-periods.week'),
								},
								{
									value: 'M',
									label: t('time-periods.month'),
								},
								{
									value: 'Y',
									label: t('time-periods.year'),
								},
							]}
						/>
						<VolumeSourcesOptionsLabel>
							{t('volume-sources.labels.category')}:
						</VolumeSourcesOptionsLabel>
						<Select
							onChange={setPartnerTableCategory}
							value={partnerTableCategory}
							options={[
								{
									value: 'usdVolume',
									label: t('volume-sources.columns.usdVolume'),
								},
								{
									value: 'usdFees',
									label: t('volume-sources.columns.usdFees'),
								},
								{
									value: 'trades',
									label: t('volume-sources.columns.trades'),
								},
							]}
						/>
					</VolumeSourcesOptions>
					{reducedPartnerData.length ? (
						<LongTableContainer>
							<Table
								columns={[
									{
										id: 'name',
										Header: (
											<StyledTableHeader>{t('volume-sources.columns.partner')}</StyledTableHeader>
										),
										accessor: 'partner',
										//sortType: 'basic',
										Cell: (cellProps: CellProps<ExchangePartnerData>) => (
											<InterSpan>{_.capitalize(cellProps.row.original.partner)}</InterSpan>
										),
										width: 200,
										sortable: false,
									},
									{
										id: 'result',
										Header: <StyledTableHeader>{partnerTableCategory.label}</StyledTableHeader>,
										accessor: partnerTableCategory.value,
										sortType: 'basic',
										Cell: (cellProps: CellProps<ExchangePartnerData>) => (
											<InterSpan>
												{partnerTableCategory.value == 'trades'
													? (cellProps.row.original as any)[partnerTableCategory.value]
													: formatCurrency(
															(cellProps.row.original as any)[partnerTableCategory.value]
													  )}
											</InterSpan>
										),
										width: 200,
										sortable: true,
									},
								]}
								columnsDeps={[partnerTableCategory]}
								data={reducedPartnerData}
								options={{ initialState: { sortBy: [{ id: 'result', desc: true }] } }}
							/>
						</LongTableContainer>
					) : (
						<Skeleton />
					)}
				</VolumeSourcesContainer>

				<TradersCountContainer>
					<StatsBox
						key="TOTALNOUNQTRADERS"
						title={t('total-number-unique-traders.title')}
						num={generalTradingInfo.data?.totalUsers || null}
						queries={[generalTradingInfo]}
						percentChange={null}
						subText={t('total-number-unique-traders.subtext')}
						color={COLORS.pink}
						numberStyle="number"
						numBoxes={2}
						infoData={null}
					/>
					<StatsBox
						key="AVGDAILYTRDRS"
						title={t('average-daily-traders.title')}
						num={averageDailyTraders}
						queries={[monthlyTradersData]}
						percentChange={null}
						subText={t('average-daily-traders.subtext')}
						color={COLORS.green}
						numberStyle="number"
						numBoxes={2}
						infoData={null}
					/>
				</TradersCountContainer>
			</VolumeSourcesRow>
			<AreaChart
				periods={periods}
				activePeriod={tradesChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTradesChartPeriod(period);
				}}
				data={tradesFormattedChartData}
				title={t('number-of-trades.title')}
				num={totalTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="number-of-trades.infoData"
						components={{
							linkText: <LinkText href={synthetixExchangesSubgraph} />,
							fullLineLink: <FullLineLink href={githubSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
		</>
	);
};

export default Trading;

const VolumeSourcesRow = styled.div`
	display: flex;
	margin: 0px auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const VolumeSourcesContainer = styled.div`
	flex-basis: 50%;
	background: ${(props) => props.theme.colors.mediumBlue};
	margin-right: 20px;
	padding: 20px;
`;

const TradersCountContainer = styled.div`
	flex-basis: 50%;

	min-width: 400px;

	> * {
		width: 100%;
		box-sizing: border-box;
		margin-top: 0;
		padding-top: 20px;
		height: auto;
	}

	> *:first-child {
		margin-bottom: 20px;
	}
`;

const VolumeSourcesOptions = styled.div`
	display: flex;
	align-items: center;
	padding-top: 20px;
	padding-bottom: 20px;

	> * {
		margin-right: 10px;
	}
`;

const VolumeSourcesOptionsLabel = styled.span`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const LongTableContainer = styled.div`
	overflow-y: scroll;
	height: 200px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 13px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.white};
`;

const InterSpan = styled.span`
	font-family: 'Inter', sans-serif;
`;
