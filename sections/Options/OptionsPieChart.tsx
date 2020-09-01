import { FC } from 'react';
import styled from 'styled-components';

import PieChart from '../../components/Charts/PieChart';
import { ChartTitle, ChartSubtitle } from '../../components/common';
import { SynthTotalSupply } from '../../types/data';

type OptionsPieChartProps = {
	data: SynthTotalSupply[];
};

const OptionsPieChart: FC<OptionsPieChartProps> = ({ data }) => {
	return (
		<OptionsPieChartContainer>
			<ChartTitle>BINARY MARKETS DOMINANCE</ChartTitle>
			<ChartSubtitle>Distribution of synths within the network</ChartSubtitle>
			<PieChart data={data} />
		</OptionsPieChartContainer>
	);
};

const OptionsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 48%;
	height: 560px;
	margin-top: 20px;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default OptionsPieChart;
