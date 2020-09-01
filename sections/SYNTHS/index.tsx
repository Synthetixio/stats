import { FC, useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import ethers from 'ethers';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';

import SectionHeader from '../../components/SectionHeader';
import SynthsBarChart from './SynthsBarChart';
import SynthsPieChart from './SynthsPieChart';
import { MAX_PAGE_WIDTH, COLORS } from '../../constants/styles';
import { SNXJSContext, SUSDContext } from '../../pages/_app';
import { OpenInterest, SynthTotalSupply } from '../../types/data';
import SingleStatRow from 'components/SingleStatRow';
import DoubleStatsBox from 'components/DoubleStatsBox';
import StatsRow from '../../components/StatsRow';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;
const NUMBER_OF_TOP_SYNTHS = 3;
const subtitleText = (name: string) =>
	`Tracks the price of ${name} through price feeds supplied by an oracle.`;

const SynthsSection: FC<{}> = () => {
	const [pieChartData, setPieChartData] = useState<SynthTotalSupply[]>([]);
	const [barChartData, setBarChartData] = useState<OpenInterest>({});
	const snxjs = useContext(SNXJSContext);
	const { sUSDPrice } = useContext(SUSDContext);
	useEffect(() => {
		const fetchData = async () => {
			const SynthSummaryUtil = new ethers.Contract(
				synthSummaryUtilContract.address,
				synthSummaryUtilContract.abi,
				ethers.getDefaultProvider()
			);

			const synthTotalSupplies = await SynthSummaryUtil.synthsTotalSupplies();

			let totalValue = 0;
			const unsortedOpenInterest: SynthTotalSupply[] = [];
			for (let i = 0; i < synthTotalSupplies[0].length; i++) {
				let value = Number(snxjs.utils.formatEther(synthTotalSupplies[2][i]));
				unsortedOpenInterest.push({
					name: snxjs.utils.parseBytes32String(synthTotalSupplies[0][i]),
					totalSupply: Number(snxjs.utils.formatEther(synthTotalSupplies[1][i])),
					value,
				});
				totalValue += value;
			}

			const openInterestSynths = snxjs.synths
				.filter((synth) => ['crypto', 'index'].includes(synth.category))
				.map(({ name }) => name);

			const openInterest: OpenInterest = orderBy(unsortedOpenInterest, 'value', 'desc')
				.filter((item) => openInterestSynths.includes(item.name))
				.reduce((acc: OpenInterest | {}, curr: SynthTotalSupply): OpenInterest | {} => {
					const name = curr.name.slice(1);
					const subObject = {
						[curr.name]: {
							value: curr.value,
							totalSupply: curr.totalSupply,
						},
					};
					if (acc[name]) {
						acc[name] = { ...acc[name], ...subObject };
					} else {
						acc[name] = subObject;
					}
					return acc;
				}, {});

			const formattedPieChartData = unsortedOpenInterest.reduce((acc, curr) => {
				if (curr.value / totalValue < MIN_PERCENT_FOR_PIE_CHART) {
					const othersIndex = findIndex(acc, (o) => o.name === 'others');
					if (othersIndex === -1) {
						acc.push({ name: 'others', value: curr.value });
					} else {
						acc[othersIndex].value = acc[othersIndex].value + curr.value;
					}
				} else {
					acc.push(curr);
				}
				return acc;
			}, []);
			setBarChartData(openInterest);
			setPieChartData(orderBy(formattedPieChartData, 'value', 'desc'));
		};
		fetchData();
	}, []);
	const totalValue = pieChartData.reduce((acc, { value }) => acc + value, 0);
	return (
		<>
			<SectionHeader title="SYNTHS" />
			<SingleStatRow
				text="TOTAL SYNTHS"
				subtext="The total value of all synths in USD"
				num={totalValue}
				color={COLORS.green}
			/>
			<SynthsCharts>
				<SynthsBarChart data={barChartData} />
				<SynthsPieChart data={pieChartData} />
			</SynthsCharts>
			<SubsectionHeader>CURRENT TOP 3 SYNTHS</SubsectionHeader>
			<StatsRow>
				{pieChartData.map(({ name, totalSupply, value }: SynthTotalSupply, index: number) => {
					if (index < NUMBER_OF_TOP_SYNTHS) {
						return (
							<DoubleStatsBox
								key={name}
								title={name}
								subtitle={subtitleText(name)}
								firstMetricTitle="PRICE"
								firstMetric={name === 'sUSD' ? sUSDPrice : value / (totalSupply ?? 0)}
								firstColor={index === 0 ? COLORS.pink : COLORS.green}
								secondMetricTitle="MARKET CAP"
								secondMetric={value}
								secondColor={index === 2 ? COLORS.pink : COLORS.green}
							/>
						);
					}
					return null;
				})}
			</StatsRow>
		</>
	);
};

const SynthsCharts = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	display: flex;
	margin: 20px auto;
	justify-content: space-between;
	@media only screen and (max-width: 854px) {
		display: block;
	}
`;

const SubsectionHeader = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	font-family: 'GT America', sans-serif;
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 120%;
	margin: 40px auto 20px auto;
`;

export const synthSummaryUtilContract = {
	address: '0x0D69755e12107695E544842BF7F61D9193f09a54',
	abi: [
		{
			constant: true,
			inputs: [],
			name: 'synthsTotalSupplies',
			outputs: [
				{
					name: '',
					type: 'bytes32[]',
				},
				{
					name: '',
					type: 'uint256[]',
				},
				{
					name: '',
					type: 'uint256[]',
				},
			],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
	],
};

export default SynthsSection;
