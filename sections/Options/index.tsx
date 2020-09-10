import { FC, useEffect, useState } from 'react';
import snxData from 'synthetix-data';
import findIndex from 'lodash/findIndex';
import { format } from 'date-fns';

import SectionHeader from '../../components/SectionHeader';
import StatsBox from '../../components/StatsBox';
import StatsRow from '../../components/StatsRow';
import { COLORS } from '../../constants/styles';
import OptionsPieChart from './OptionsPieChart';
import { SynthTotalSupply, OptionsMarket } from '../../types/data';
import { formatCurrency } from 'utils/formatter';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const Options: FC = () => {
	const [num24HRTx, setNum24HRTx] = useState<number | null>(null);
	const [largestMarket, setLargestMarket] = useState<OptionsMarket | null>(null);
	const [largestActiveMarket, setLargestActiveMarket] = useState<OptionsMarket | null>(null);
	const [numMarkets, setNumMarkets] = useState<number | null>(null);
	const [totalPoolSizes, setTotalPoolSizes] = useState<number | null>(null);
	const [pieChartData, setPieChartData] = useState<SynthTotalSupply[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const [unformattedOptionTransactions, unformattedMarkets] = await Promise.all([
				snxData.binaryOptions.optionTransactions(),
				snxData.binaryOptions.markets({ max: 5000 }),
			]);
			const now = new Date();
			const sortedMarkets = unformattedMarkets.sort((a, b) => {
				return parseFloat(b.poolSize) - parseFloat(a.poolSize);
			});

			const marketsData = sortedMarkets
				.filter((market, index) => {
					if (index === 0) {
						const { currencyKey, poolSize, maturityDate, strikePrice } = market;
						setLargestMarket({ currencyKey, poolSize, maturityDate, strikePrice });
					}
					const expiryDate = new Date(market.expiryDate);
					return expiryDate > now;
				})
				.reduce(
					([count, sum], activeMarket, index) => {
						if (index === 0) {
							const { currencyKey, poolSize, maturityDate, strikePrice } = activeMarket;
							setLargestActiveMarket({ currencyKey, poolSize, maturityDate, strikePrice });
						}
						count++;
						sum += parseFloat(activeMarket.poolSize);
						return [count, sum];
					},
					[0, 0]
				);

			const totalPoolSizes = marketsData[1];

			const formattedPieChartData = sortedMarkets.reduce((acc, curr) => {
				if (curr.poolSize / totalPoolSizes < MIN_PERCENT_FOR_PIE_CHART) {
					const othersIndex = findIndex(acc, (o) => o.name === 'others');
					if (othersIndex === -1) {
						acc.push({ name: 'others', value: curr.value });
					} else {
						acc[othersIndex].value = acc[othersIndex].value + curr.poolSize;
					}
				} else {
					acc.push({
						name: `${curr.currencyKey} > ${formatCurrency(curr.strikePrice)} @${format(
							new Date(curr.maturityDate),
							'MM/dd/yyyy'
						)}`,
						value: curr.poolSize,
					});
				}
				return acc;
			}, []);

			setNumMarkets(marketsData[0]);
			setTotalPoolSizes(totalPoolSizes);
			setPieChartData(formattedPieChartData);

			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const optionTransactions = unformattedOptionTransactions.filter((optionTx) => {
				return new Date(optionTx.timestamp) > yesterday;
			});

			setNum24HRTx(optionTransactions.length);
		};
		fetchData();
	}, []);

	return (
		<>
			<SectionHeader title="OPTIONS" />
			<StatsRow>
				<StatsBox
					key="LGSTACTVBINMKT"
					title="LARGEST ACTIVE BINARY MARKET (USD)"
					num={largestActiveMarket?.poolSize ?? 0}
					percentChange={null}
					subText={`The largest active binary options market is ${
						largestActiveMarket?.currencyKey ?? '...'
					} > ${largestActiveMarket?.strikePrice ?? '...'} expiring at ${
						largestActiveMarket?.maturityDate
							? format(new Date(largestActiveMarket?.maturityDate), 'MM/dd/yyyy')
							: '...'
					}`}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
				/>
				<StatsBox
					key="LGSTBINMKTTODATE"
					title="LARGEST BINARY MARKET TO DATE (USD)"
					num={largestMarket?.poolSize ?? 0}
					percentChange={null}
					subText={`The largest binary options market to date is ${
						largestMarket?.currencyKey ?? '...'
					} > ${largestMarket?.strikePrice ?? '...'} expiring at ${
						largestMarket?.maturityDate
							? format(new Date(largestMarket?.maturityDate), 'MM/dd/yyyy')
							: '...'
					}`}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTALVOLUMETRDED"
					title="TOTAL VOLUME TRADED (USD)"
					num={0}
					percentChange={null}
					subText="The total volume traded for binary options markets to date"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="NUMBNRYMRKTS"
					title="NUMBER OF ACTIVE BINARY OPTIONS MARKETS"
					num={numMarkets}
					percentChange={null}
					subText="The current number of active binary options markets"
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
				/>
				<StatsBox
					key="TTLAMOUNTPOOLEDBINOPT"
					title="TOTAL AMOUNT POOLED IN BINARY OPTIONS (USD)"
					num={totalPoolSizes}
					percentChange={null}
					subText="The total amount of capital pooled in active binary options markets"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
				/>
				<StatsBox
					key="TRADESBINOPTION"
					title="TRADES OVER 24 HOURS IN BINARY OPTIONS"
					num={num24HRTx}
					percentChange={null}
					subText="The total number of trades over the past 24 hours in binary options markets"
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={3}
				/>
			</StatsRow>
			<OptionsPieChart data={pieChartData} />
		</>
	);
};

export default Options;
