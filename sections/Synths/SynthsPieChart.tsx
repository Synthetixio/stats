import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PieChart from 'components/Charts/PieChart';
import { ChartTitle, ChartSubtitle } from 'components/common';
import { SynthTotalSupply } from 'types/data';

type SynthsPieChartProps = {
	data: SynthTotalSupply[];
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ data }) => {
	const { t } = useTranslation();
	return (
		<SynthsPieChartContainer>
			<ChartTitle>{t('synth-pie-chart.title')}</ChartTitle>
			<ChartSubtitle>{t('synth-pie-chart.subtext')}</ChartSubtitle>
			<PieChart data={data} isShortLegend={true} />
		</SynthsPieChartContainer>
	);
};

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 49%;
	height: 680px;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default SynthsPieChart;
