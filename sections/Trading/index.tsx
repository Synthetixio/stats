import { FC, useEffect, useState } from 'react';
import snxData from 'synthetix-data';

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
import { getPostArchernarTotals } from 'utils/customGraphQueries';

const Trading: FC = () => {
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

	const fetchNewChartData = async (fetchPeriod: ChartPeriod, type: 'trade' | 'volume' | 'both') => {
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
		fetchNewChartData(tradesChartPeriod, 'both');
	}, []);

	const periods: ChartPeriod[] = ['W', 'M', 'Y'];
	return (
		<>
			<SectionHeader title="TRADING" />
			<StatsRow>
				<StatsBox
					key="TOTALTRDVOLUME"
					title="TOTAL TRADING VOLUME"
					num={totalTradingVolume}
					percentChange={null}
					subText="Historical trading volume for all Synths"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<>
							The total trading volume only shows data from after the Archernar release on{' '}
							<LinkText href={etherscanArchernarBlock}>block 9,518,914 (Feb 20, 2020).</LinkText>{' '}
							Prior to this release significant volume was generated via{' '}
							<LinkText href={frontRunningWiki}>front running</LinkText> attempts.
						</>
					}
				/>
				<StatsBox
					key="TOTLFEES"
					title="TOTAL TRADING FEES"
					num={totalTradingFees}
					percentChange={null}
					subText="Historical trading fees for all Synths"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<>
							The total trading fees only shows data from after the Archernar release on{' '}
							<LinkText href={etherscanArchernarBlock}>block 9,518,914 (Feb 20, 2020).</LinkText>{' '}
							Prior to this release significant volume was generated via{' '}
							<LinkText href={frontRunningWiki}>front running</LinkText> attempts.
						</>
					}
				/>
				<StatsBox
					key="TOTLNOTRDES"
					title="TOTAL NUMBER OF TRADES"
					num={totalTrades}
					percentChange={null}
					subText="Total historical trades for all Synths"
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<>
							The total number of trades only shows data from after the Archernar release on{' '}
							<LinkText href={etherscanArchernarBlock}>block 9,518,914 (Feb 20, 2020).</LinkText>{' '}
							Prior to this release significant volume was generated via{' '}
							<LinkText href={frontRunningWiki}>front running</LinkText> attempts.
						</>
					}
				/>
				<StatsBox
					key="TOTLDAILYVOLUME"
					title="24HR EXCHANGE VOLUME"
					num={totalDailyTradingVolume}
					percentChange={null}
					subText="Total Synth trading volume over the past 24 hours"
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
					fetchNewChartData(period, 'volume');
				}}
				data={volumeChartData}
				title="TRADING VOLUME"
				num={totalVolumeOverPeriod}
				numFormat="currency0"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<>
						Each day we capture trading volume in the Synthetix protocol via the{' '}
						<LinkText href={synthetixExchangesSubgraph}>Synthetix exchanges subgraph</LinkText>{' '}
						using the "DailyTotal" entity.
						<NewParagraph>
							The annual chart includes data from before the Archernar release on{' '}
							<LinkText href={etherscanArchernarBlock}>block 9,518,914 (Feb 20, 2020).</LinkText>{' '}
							Prior to this release significant volume was generated via{' '}
							<LinkText href={frontRunningWiki}>front running</LinkText> attempts.
						</NewParagraph>
					</>
				}
			/>
			<StatsRow>
				<StatsBox
					key="TOTALNOUNQTRADERS"
					title="TOTAL NUMBER OF UNIQUE TRADERS"
					num={totalUsers}
					percentChange={null}
					subText="Ethereum addresses that have traded Synths"
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={2}
					infoData={null}
				/>
				<StatsBox
					key="AVGDAILYTRDRS"
					title="AVERAGE DAILY TRADERS"
					num={averageDailyTraders}
					percentChange={null}
					subText="Average daily traders over the past 30 days"
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
					fetchNewChartData(period, 'trade');
				}}
				data={tradesChartData}
				title="NUMBER OF TRADES"
				num={totalTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
				infoData={
					<>
						The number of trades is the sum of all daily periods in each chart below. The weekly
						chart (default) has 7 unique periods, monthly has 30 and annual has 365.{' '}
						<NewParagraph>
							The number of trades is captured daily in the synthetix exchanges subgraph using the
							"DailyTotal" entity{' '}
							<LinkText href={synthetixExchangesSubgraph}>(view playground).</LinkText>
						</NewParagraph>
						<FullLineLink href={githubSubgraph}>See GitHub repo for this subgraph</FullLineLink>
					</>
				}
			/>
		</>
	);
};

export default Trading;
