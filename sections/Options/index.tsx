import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import snxData from 'synthetix-data';
import findIndex from 'lodash/findIndex';
import { format } from 'date-fns';

import SectionHeader from '../../components/SectionHeader';
import StatsBox from '../../components/StatsBox';
import StatsRow from '../../components/StatsRow';
import { COLORS, MAX_PAGE_WIDTH } from '../../constants/styles';
import OptionsPieChart from './OptionsPieChart';
import { SynthTotalSupply } from '../../types/data';
import { formatCurrency } from 'utils/formatter';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const Options: FC = () => {
	const [num24HRTx, setNum24HRTx] = useState<number>(0);
	const [largestActiveMarketSize, setLargestActiveMarketSize] = useState<number>(0);
	const [largestActiveMarketName, setLargestActiveMarketName] = useState<string>('');
	const [largestMarketSize, setLargestMarketSize] = useState<number>(0);
	const [largestMarketName, setLargestMarketName] = useState<string>('');
	const [numMarkets, setNumMarkets] = useState<number>(0);
	const [totalPoolSizes, setTotalPoolSizes] = useState<number>(0);
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
						setLargestMarketName(market.currencyKey);
						setLargestMarketSize(parseFloat(market.poolSize));
					}
					const expiryDate = new Date(market.expiryDate);
					return expiryDate > now;
				})
				.reduce(
					([count, sum], activeMarket, index) => {
						if (index === 0) {
							setLargestActiveMarketName(activeMarket.currencyKey);
							setLargestActiveMarketSize(parseFloat(activeMarket.poolSize));
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
						name: `${curr.currencyKey} at ${formatCurrency(curr.strikePrice)} expiring ${format(
							new Date(curr.maturityDate),
							'MM/dd/yy'
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
					num={largestActiveMarketSize}
					percentChange={null}
					subText={`The largest active binary options market is ${largestActiveMarketName}`}
					color={COLORS.green}
					numberStyle="currency"
					numBoxes={3}
				/>
				<StatsBox
					key="LGSTBINMKTTODATE"
					title="LARGEST BINARY MARKET TO DATE (USD)"
					num={largestMarketSize}
					percentChange={null}
					subText={`The largest binary options market to date is ${largestMarketName}`}
					color={COLORS.pink}
					numberStyle="currency"
					numBoxes={3}
				/>
				<StatsBox
					key="TOTALVOLUMETRDED"
					title="TOTAL VOLUME TRADED (USD)"
					num={0}
					percentChange={null}
					subText="The total volume traded for binary options markets to date"
					color={COLORS.pink}
					numberStyle="currency"
					numBoxes={3}
				/>
			</StatsRow>
			<OptionsChartBoxesContainer>
				<OptionsBoxesContainer>
					<StatsBox
						key="NUMBNRYMRKTS"
						title="NUMBER OF ACTIVE BINARY OPTIONS MARKETS"
						num={numMarkets}
						percentChange={null}
						subText="The current number of active binary options markets"
						color={COLORS.green}
						numberStyle="number"
						numBoxes={1}
					/>
					<StatsBox
						key="TTLAMOUNTPOOLEDBINOPT"
						title="TOTAL AMOUNT POOLED IN BINARY OPTIONS (USD)"
						num={totalPoolSizes}
						percentChange={null}
						subText="The total amount of capital pooled in active binary options markets"
						color={COLORS.green}
						numberStyle="currency"
						numBoxes={1}
					/>
					<StatsBox
						key="TRADESBINOPTION"
						title="TOTAL AMOUNT POOLED IN BINARY OPTIONS (USD)"
						num={num24HRTx}
						percentChange={null}
						subText="The total amount of capital pooled in active binary options markets"
						color={COLORS.green}
						numberStyle="number"
						numBoxes={1}
					/>
				</OptionsBoxesContainer>
				<OptionsPieChart data={pieChartData} />
			</OptionsChartBoxesContainer>
		</>
	);
};

const OptionsChartBoxesContainer = styled.div`
	display: flex;
	justify-content: space-between;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
`;

const OptionsBoxesContainer = styled.div`
	width: 48%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default Options;
