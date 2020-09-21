import { FC } from 'react';
import styled from 'styled-components';

import PieChart from 'components/Charts/PieChart';
import { ChartTitle, ChartSubtitle } from 'components/common';
import { SynthTotalSupply } from 'types/data';

type SynthsPieChartProps = {
	data: SynthTotalSupply[];
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ data }) => (
	<SynthsPieChartContainer>
		<ChartTitle>SYNTH DOMINANCE</ChartTitle>
		<ChartSubtitle>Distribution of Synths within the Synthetix protocol</ChartSubtitle>
		<PieChart data={data} />
	</SynthsPieChartContainer>
);

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 49%;
	height: 680px;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default SynthsPieChart;
