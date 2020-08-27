import { FC } from 'react';
import styled from 'styled-components';

import BasicAreaChart from './BasicAreaChart';
import ChartTimeSelectors from './ChartTimeSelectors';
import ChartTitle from './ChartTitle';
import { MAX_PAGE_WIDTH, NumberStyle } from '../../constants/styles';

interface AreaChartProps {
	data: Array<any>;
	periods: Array<string>;
	title: string;
	num: number;
	numFormat: NumberStyle;
	percentChange: number;
}

const AreaChart: FC<AreaChartProps> = ({ data, periods, title, num, numFormat, percentChange }) => (
	<ChartContainer>
		<ChartTitle title={title} num={num} numFormat={numFormat} percentChange={percentChange} />
		<ChartTimeSelectors
			periods={periods}
			onClick={(period: string) => console.log('period:', period)}
		/>
		<BasicAreaChart data={data} />
	</ChartContainer>
);

export default AreaChart;

const ChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	position: relative;
	margin: 20px auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;
