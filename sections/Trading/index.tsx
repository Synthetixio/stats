import { FC, useEffect, useState } from 'react';
import snxData from 'synthetix-data';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import SingleStatRow from 'components/SingleStatRow';
import StatsBox from 'components/StatsBox';
import AreaChart from 'components/Charts/AreaChart';
import { COLORS } from 'constants/styles';
import { ChartPeriod, AreaChartData, TradesRequestData } from 'types/data';
import { formatIdToIsoString } from 'utils/formatter';

const Trading: FC = () => {
	const [totalTradingVolume, setTotalTradingVolume] = useState<number | null>(null);
	const [totalDailyTradingVolume, setTotalDailyTradingVolume] = useState<number | null>(null);
	const [totalTrades, setTotalTrades] = useState<number | null>(null);
	const [totalUsers, setTotalUsers] = useState<number | null>(null);
	const [tradesChartPeriod, setTradesChartPeriod] = useState<ChartPeriod>('W');
	const [tradesChartData, setTradesChartData] = useState<AreaChartData[]>([]);
	const [tradersChartPeriod, setTradersChartPeriod] = useState<ChartPeriod>('W');
	const [tradersChartData, setTradersChartData] = useState<AreaChartData[]>([]);
	const [totalTradesOverPeriod, setTotalTradesOverPeriod] = useState<number | null>(null);
	const [totalTradersOverPeriod, setTotalTradersOverPeriod] = useState<number | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const ts = Math.floor(Date.now() / 1e3);
			const oneDayAgo = ts - 3600 * 24;

			const [exchangeVolumeData, exchanges] = await Promise.all([
				snxData.exchanges.total(),
				snxData.exchanges.since({ minTimestamp: oneDayAgo }),
			]);
			const last24Hours = exchanges.reduce((acc, { fromAmountInUSD }) => acc + fromAmountInUSD, 0);

			setTotalDailyTradingVolume(last24Hours);
			setTotalTradingVolume(exchangeVolumeData.exchangeUSDTally);
			setTotalTrades(exchangeVolumeData.trades);
			setTotalUsers(exchangeVolumeData.exchangers);
		};
		fetchData();
	}, []);

	const formatChartData = (
		data: TradesRequestData[],
		type: 'trade' | 'trader'
	): AreaChartData[] => {
		const cumulativeArray: AreaChartData[] = [];
		data.forEach(({ id, trades, exchangers }, index) => {
			if (index === 0) {
				return cumulativeArray.push({
					created: formatIdToIsoString(id, '1d'),
					value: type === 'trade' ? trades : exchangers,
				});
			}
			return cumulativeArray.push({
				created: formatIdToIsoString(id, '1d'),
				value:
					type === 'trade'
						? trades + cumulativeArray[index - 1].value
						: exchangers + cumulativeArray[index - 1].value,
			});
		});
		return cumulativeArray;
	};

	const setChartData = (data: TradesRequestData[], type: 'trade' | 'trader') => {
		const formattedChartData = formatChartData(data, type);
		if (type === 'trade') {
			setTotalTradesOverPeriod(
				formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].value : 0
			);
			setTradesChartData(formattedChartData);
		} else if (type === 'trader') {
			setTotalTradersOverPeriod(
				formattedChartData.length > 0 ? formattedChartData[formattedChartData.length - 1].value : 0
			);
			setTradersChartData(formattedChartData);
		}
	};

	const fetchNewChartData = async (fetchPeriod: ChartPeriod, type: 'trade' | 'trader' | 'both') => {
		const timeSeries = '1d';
		let tradesOverPeriodData = [];
		if (fetchPeriod === 'W') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 7 });
		} else if (fetchPeriod === 'M') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y') {
			tradesOverPeriodData = await snxData.exchanges.aggregate({ timeSeries, max: 365 });
		}

		if (type === 'both') {
			setChartData(tradesOverPeriodData, 'trade');
			setChartData(tradesOverPeriodData, 'trader');
		} else if (type === 'trader' || type === 'trade') {
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
					subText="Total historical trading volume for synths"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTLNOTRDES"
					title="TOTAL NUMBER OF TRADES"
					num={totalTrades}
					percentChange={null}
					subText="Total historical trades for synths"
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTLDAILYVOLUME"
					title="24HR EXCHANGE VOLUME"
					num={totalDailyTradingVolume}
					percentChange={null}
					subText="Total Synth trading volume over the past 24 hours"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
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
				title="CUMULATIVE NUMBER OF TRADES"
				num={totalTradesOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
			/>
			<SingleStatRow
				text="TOTAL NUMBER OF UNIQUE TRADERS"
				subtext="Total number of Ethereum addresses trading synths"
				num={totalUsers}
				color={COLORS.pink}
				numberStyle="number"
			/>
			<AreaChart
				periods={periods}
				activePeriod={tradersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setTradersChartData([]); // will force loading state
					setTradersChartPeriod(period);
					fetchNewChartData(period, 'trader');
				}}
				data={tradersChartData}
				title="CUMULATIVE DAILY TRADERS"
				num={totalTradersOverPeriod}
				numFormat="number"
				percentChange={null}
				timeSeries="1d"
			/>
		</>
	);
};

export default Trading;
