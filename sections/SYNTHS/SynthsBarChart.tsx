import { FC } from 'react';
import styled from 'styled-components';

import SidewaysBarChart from '../../components/Charts/SidewaysBarChart';
import { SynthsChartTitle, SynthsChartSubtitle } from './common';
import { OpenInterest } from '../../types/data';

type SynthsBarChartProps = {
	data: OpenInterest;
};

const SynthsBarChart: FC<SynthsBarChartProps> = ({ data }) => (
	<SynthsBarChartContainer>
		<SynthsChartTitle>SYNTH vs iSYNTH</SynthsChartTitle>
		<SynthsChartSubtitle>Long/short interest on crptoassets</SynthsChartSubtitle>
		<SidewaysBarChart data={data} />
	</SynthsBarChartContainer>
);

const SynthsBarChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 48%;
	height: 500px;
	overflow-y: scroll;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default SynthsBarChart;
