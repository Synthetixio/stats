import { FC, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { COLORS } from 'constants/styles';
import { ChartPeriod, AreaChartData, TradesRequestData } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';
import { LinkText, FullLineLink, NewParagraph } from 'components/common';
import {
	synthetixExchangesSubgraph,
	githubSubgraph,
	etherscanArchernarBlock,
	frontRunningWiki,
} from 'constants/links';
import { usePageResults } from 'queries/shared/usePageResults';
import { synthetixExchanges } from 'constants/graph-urls';
import { useTradesOverPeriodQuery, useGeneralTradingInfoQuery } from 'queries/trading';
import { periodToDays } from 'utils/dataMapping';

function getTotalValue(data: AreaChartData[]): number {
	return data.reduce((acc, curr) => (acc += curr.value), 0);
}

function formatChartData(data: TradesRequestData[], type: 'trade' | 'volume'): AreaChartData[] {
	return data.map(({ id, trades, exchangeUSDTally }) => ({
		created: formatIdToIsoString(id, '1d'),
		value: type === 'trade' ? trades : exchangeUSDTally,
	}));
}

const Trading: FC = () => {
	const { t } = useTranslation();

	const [tradesChartPeriod, setTradesChartPeriod] = useState<ChartPeriod>('M');
	const [volumeChartPeriod, setVolumeChartPeriod] = useState<ChartPeriod>('M');

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
			<StatsRow>
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
			</StatsRow>
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
