import { FC, useEffect, useState } from 'react';
import snxData from 'synthetix-data';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { COLORS } from 'constants/styles';
import { ChartPeriod, AreaChartData, StackedAreaChartData, TradesRequestData } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';
import { LinkText, FullLineLink, NewParagraph } from 'components/common';
import { useVolumeSourcesTimeQuery, DailyVolumeSource } from 'queries/trading';
import {
	synthetixExchangesSubgraph,
	synthetixExchangerSubgraph,
	volumePartnerExchangeWithTrackingLink,
	githubSubgraph,
	etherscanArchernarBlock,
	frontRunningWiki,
} from 'constants/links';
import { getPostArchernarTotals } from 'utils/customGraphQueries';

const Trading: FC = () => {
	const { t } = useTranslation();
	const [totalTradingVolume, setTotalTradingVolume] = useState<number | null>(null);
	const [totalTradingFees, setTotalTradingFees] = useState<number | null>(null);
	const [totalDailyTradingVolume, setTotalDailyTradingVolume] = useState<number | null>(null);
	const [averageDailyTraders, setAverageDailyTraders] = useState<number | null>(null);
	const [totalTrades, setTotalTrades] = useState<number | null>(null);
	const [totalUsers, setTotalUsers] = useState<number | null>(null);
	const [tradesChartPeriod, setTradesChartPeriod] = useState<ChartPeriod>('M');
	const [tradesChartData, setTradesChartData] = useState<AreaChartData[]>([]);
	const [volumeChartPeriod, setVolumeChartPeriod] = useState<ChartPeriod>('M');
	const [volumeChartData, setVolumeChartData] = useState<AreaChartData[]>([]);
	const [volumeSourcesChartPeriod, setVolumeSourcesChartPeriod] = useState<ChartPeriod>('M');
	const [totalTradesOverPeriod, setTotalTradesOverPeriod] = useState<number | null>(null);
	const [totalVolumeOverPeriod, setTotalVolumeOverPeriod] = useState<number | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const ts = Math.floor(Date.now() / 1e3);
			const oneDayAgo = ts - 3600 * 24;

			const [exchangeVolumeData, exchanges, allTimeData] = await Promise.all([
				getPostArchernarTotals(),
				snxData.exchanges.since({ minTimestamp: oneDayAgo }),
				snxData.exchanges.total(),
			]);
			// @ts-ignore
			const last24Hours = exchanges.reduce((acc, { fromAmountInUSD }) => acc + fromAmountInUSD, 0);

			setTotalDailyTradingVolume(last24Hours);
			setTotalTradingVolume(exchangeVolumeData.exchangeUSDTally);
			setTotalTradingFees(exchangeVolumeData.totalFeesGeneratedInUSD);
			setTotalTrades(exchangeVolumeData.trades);
			setTotalUsers(allTimeData.exchangers);
		};
		fetchData();
	}, []);

	export const groupVolumeSourcesData = (data: DailyVolumeSource[]): StackedAreaChartData[] {
		const partnersData = {}
		const unsorted = data.reduce(({ dayID, partner, trades, usdFees, usdVolume }) => {

		}, {})

// 		0: {dayID: 18568, partner: "KWENTA", trades: 5, usdFees: 41.62, usdVolume: 5346.19}
// 1: {dayID: 18568, partner: "DHEDGE", trades: 13, usdFees: 222.22, usdVolume: 36146.1}
// 2: {dayID: 18568, partner: "1INCH", trades: 2, usdFees: 11.45, usdVolume: 3815.51}
// 3: {dayID: 18567, partner: "KWENTA", trades: 4, usdFees: 17.27, usdVolume: 5757.24}
// 	}



	const { data: volumeSourcesData, status: volumeSourcesStatus } = useVolumeSourcesTimeQuery(
		volumeSourcesChartPeriod
	);

	const {
		volumeSourcesChartData,
		totalVolumeSourcesTradesOverPeriod,
	}: {
		volumeSourcesChartData: AreaChartData[];
		totalVolumeSourcesTradesOverPeriod: number | null;
	} =
		volumeSourcesStatus == 'success'
			? (volumeSourcesData ?? []).reduce(
					(acc, curr) => {
						acc.volumeSourcesChartData.push({
							created: formatIdToIsoString(curr.dayID, '1d'),
							value: curr.usdVolume,
						});
						return acc;
					},
					{ volumeSourcesChartData: [], totalVolumeSourcesTradesOverPeriod: 0 }
			  )
			: { volumeSourcesChartData: [], totalVolumeSourcesTradesOverPeriod: null };

	const formatChartData = (data: TradesRequestData[], type: 'trade' | 'volume'): AreaChartData[] =>
		data.map(({ id, trades, exchangeUSDTally }) => ({
			created: formatIdToIsoString(id, '1d'),
			value: type === 'trade' ? trades : exchangeUSDTally,
		}));

	const getTotalValue = (data: AreaChartData[]) =>
		data.reduce((acc, curr) => (acc += curr.value), 0);

	const setChartData = (data: TradesRequestData[], type: 'trade' | 'volume') => {
		const formattedChartData = formatChartData(data, type);
		const aggregate = formattedChartData.length > 0 ? getTotalValue(formattedChartData) : 0;
		if (type === 'trade') {
			setTotalTradesOverPeriod(aggregate);
			setTradesChartData(formattedChartData);
		} else if (type === 'volume') {
			setTotalVolumeOverPeriod(aggregate);
			setVolumeChartData(formattedChartData);
		}
	};

	const fetchNewTradeOrVolumeChartData = async (
		fetchPeriod: ChartPeriod,
		type: 'trade' | 'volume' | 'both'
	) => {
		const timeSeries = '1d';
		let tradesOverPeriodData = [];
		if (fetchPeriod === 'W') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 7 });
		} else if (fetchPeriod === 'M') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 30 });
			const totalMonthlyTraders = tradesOverPeriodData.reduce(
				(acc: number, { exchangers }: TradesRequestData) => {
					acc += exchangers;
					return acc;
				},
				0
			);
			setAverageDailyTraders(Math.floor(totalMonthlyTraders / 30));
		} else if (fetchPeriod === 'Y') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 365 });
		}
		tradesOverPeriodData = tradesOverPeriodData.reverse();

		if (type === 'both') {
			setChartData(tradesOverPeriodData, 'trade');
			setChartData(tradesOverPeriodData, 'volume');
		} else if (type === 'volume' || type === 'trade') {
			setChartData(tradesOverPeriodData, type);
		}
	};

	useEffect(() => {
		fetchNewTradeOrVolumeChartData(tradesChartPeriod, 'both');
	}, []);

	const periods: ChartPeriod[] = ['W', 'M', 'Y'];
	return (
		<>
			<SectionHeader title={t('homepage.section-header.trading')} />
			<StatsRow>
				<StatsBox
					key="TOTALTRDVOLUME"
					title={t('homepage.total-trading-volume.title')}
					num={totalTradingVolume}
					percentChange={null}
					subText={t('homepage.total-trading-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-trading-volume.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLFEES"
					title={t('homepage.total-trading-fees.title')}
					num={totalTradingFees}
					percentChange={null}
					subText={t('homepage.total-trading-fees.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-trading-fees.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLNOTRDES"
					title={t('homepage.total-number-of-trades.title')}
					num={totalTrades}
					percentChange={null}
					subText={t('homepage.total-number-of-trades.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-number-of-trades.infoData"
							components={{
								linkText: <LinkText href={etherscanArchernarBlock} />,
								linkText2: <LinkText href={frontRunningWiki} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TOTLDAILYVOLUME"
					title={t('homepage.24hr-exchange-volume.title')}
					num={totalDailyTradingVolume}
					percentChange={null}
					subText={t('homepage.24hr-exchange-volume.subtext')}
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
					setVolumeChartData([]); // will force loading state
					setVolumeChartPeriod(period);
					fetchNewTradeOrVolumeChartData(period, 'volume');
				}}
				data={volumeChartData}
				title={t('homepage.trading-volume.title')}
				num={totalVolumeOverPeriod}
				numFormat="currency0"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="homepage.trading-volume.infoData"
						components={{
							linkText: <LinkText href={synthetixExchangesSubgraph} />,
							linkText2: <LinkText href={etherscanArchernarBlock} />,
							linkText3: <LinkText href={frontRunningWiki} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<StatsRow>
				<StatsBox
					key="TOTALNOUNQTRADERS"
					title={t('homepage.total-number-unique-traders.title')}
					num={totalUsers}
					percentChange={null}
					subText={t('homepage.total-number-unique-traders.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={2}
					infoData={null}
				/>
				<StatsBox
					key="AVGDAILYTRDRS"
					title={t('homepage.average-daily-traders.title')}
					num={averageDailyTraders}
					percentChange={null}
					subText={t('homepage.average-daily-traders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={2}
					infoData={null}
				/>
			</StatsRow>
			<AreaChart
				periods={periods}
				activePeriod={tradesChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTradesChartData([]); // will force loading state
					setTradesChartPeriod(period);
					fetchNewTradeOrVolumeChartData(period, 'trade');
				}}
				data={tradesChartData}
				title={t('homepage.number-of-trades.title')}
				num={totalTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="homepage.number-of-trades.infoData"
						components={{
							linkText: <LinkText href={synthetixExchangesSubgraph} />,
							fullLineLink: <FullLineLink href={githubSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<AreaChart
				periods={periods}
				activePeriod={volumeSourcesChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setVolumeSourcesChartPeriod(period);
				}}
				data={volumeSourcesChartData}
				title={t('homepage.volume-sources.title')}
				num={totalVolumeSourcesTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<Trans
						i18nKey="homepage.volume-sources.infoData"
						components={{
							linkText: <LinkText href={volumePartnerExchangeWithTrackingLink} />,
							linkText2: <LinkText href={synthetixExchangerSubgraph} />,
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
