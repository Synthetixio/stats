import { FC } from 'react';
import styled from 'styled-components';

import PieChart from '../../components/Charts/PieChart';
import { SynthsChartTitle, SynthsChartSubtitle } from './common';
import { SynthTotalSupply } from '../../types/data';

type SynthsPieChartProps = {
	data: SynthTotalSupply;
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ data }) => {
	return (
		<SynthsPieChartContainer>
			<SynthsChartTitle>SYNTH DOMINANCE</SynthsChartTitle>
			<SynthsChartSubtitle>Distribution of synths within the network</SynthsChartSubtitle>
			<PieChart data={data} />
		</SynthsPieChartContainer>
	);
};

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 48%;
	height: 500px;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;
export default SynthsPieChart;
