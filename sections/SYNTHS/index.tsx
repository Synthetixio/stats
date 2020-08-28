import { FC, useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import ethers from 'ethers';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';

import SectionHeader from '../../components/SectionHeader';
import SynthsBarChart from './SynthsBarChart';
import SynthsPieChart from './SynthsPieChart';
import { MAX_PAGE_WIDTH } from '../../constants/styles';
import { SNXJSContext } from '../../pages/_app';
import { OpenInterest, SynthTotalSupply } from '../../types/data';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const SynthsSection: FC<{}> = () => {
	const [pieChartData, setPieChartData] = useState<SynthTotalSupply[] | []>([]);
	const [barChartData, setBarChartData] = useState<OpenInterest | {}>({});
	const snxjs = useContext(SNXJSContext);
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
	return (
		<>
			<SectionHeader title="SYNTHS" />
			<SynthsCharts>
				<SynthsBarChart data={barChartData} />
				<SynthsPieChart data={pieChartData} />
			</SynthsCharts>
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
