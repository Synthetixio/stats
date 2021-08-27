import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import PieChart from 'components/Charts/PieChart';
import { ChartTitle, ChartSubtitle } from 'components/common';
import { MAX_PAGE_WIDTH } from 'constants/styles';

export type SynthTotalSupply = {
	name: string;
	totalSupply?: number;
	value: number;
};

type OptionsPieChartProps = {
	data: SynthTotalSupply[];
};

const OptionsPieChart: FC<OptionsPieChartProps> = ({ data }) => {
	const { t } = useTranslation();
	return (
		<OptionsPieChartContainer>
			<ChartTitle>{t('options-pie-chart.title')}</ChartTitle>
			<ChartSubtitle>{t('options-pie-chart.subtext')}</ChartSubtitle>
			<PieChart data={data} isShortLegend={false} />
		</OptionsPieChartContainer>
	);
};

const OptionsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 20px auto 50px auto;
	padding: 16px 0 210px 0;
	height: 600px;
	@media only screen and (max-width: 500px) {
		height: 700px;
	}
`;

export default OptionsPieChart;
