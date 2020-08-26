import { FC } from 'react';
import styled from 'styled-components';

import BasicAreaChart from './BasicAreaChart';
import ChartTimeSelectors from './ChartTimeSelectors';
import ChartTitle from './ChartTitle';
import { NumberStyle } from '../../constants/formatter';
import { MAX_PAGE_WIDTH } from '../../constants/styles';

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
	position: relative;
	margin-bottom: 20px;
	margin-top: 20px;
	margin: 0 auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;
